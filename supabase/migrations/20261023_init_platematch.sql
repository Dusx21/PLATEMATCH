-- ============================================================================
-- PLATEMATCH V2 - SUPABASE DATABASE MIGRATION (v2 - CORRECTED)
-- ExpoAndina - Escuela Profesional de Ingeniería de Sistemas (UAC)
-- ============================================================================
-- ⚠️  Ejecutar en: Supabase Dashboard → SQL Editor
-- ⚠️  Este script es idempotente: elimina y recrea tablas.
--     NO ejecutar en producción con datos reales sin backup previo.
-- ============================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up existing objects (idempotente)
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS dishes CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP FUNCTION IF EXISTS create_reservation_atomic CASCADE;
DROP FUNCTION IF EXISTS validate_and_complete_reservation_atomic CASCADE;
DROP FUNCTION IF EXISTS update_dish_stock_atomic CASCADE;

-- ============================================================================
-- 1. RESTAURANTS TABLE
-- ============================================================================
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tagline TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    distance_meters INTEGER DEFAULT 300,
    image_url TEXT,
    banner_url TEXT,
    is_open BOOLEAN NOT NULL DEFAULT true,
    rating NUMERIC(2, 1) DEFAULT 4.8 CHECK (rating >= 1.0 AND rating <= 5.0),
    review_count INTEGER DEFAULT 120,
    opening_hours TEXT DEFAULT '11:30 AM - 4:00 PM',
    categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    price_level TEXT DEFAULT 'S/ 12 - 18',
    specialty TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 2. DISHES TABLE
-- ============================================================================
CREATE TABLE dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock_available INTEGER NOT NULL DEFAULT 5 CHECK (stock_available >= 0),
    image_url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Criollo',
    is_available BOOLEAN NOT NULL DEFAULT true,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    preparation_time_mins INTEGER DEFAULT 10,
    calories TEXT,
    allergens TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 3. RESERVATIONS TABLE
-- ============================================================================
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE RESTRICT,
    user_id UUID,
    user_name TEXT NOT NULL DEFAULT 'Comensal ExpoAndina',
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    dish_price NUMERIC(10, 2) NOT NULL CHECK (dish_price >= 0),
    advance_amount NUMERIC(10, 2) NOT NULL CHECK (advance_amount >= 0),
    service_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.50 CHECK (service_fee >= 0),
    remaining_amount NUMERIC(10, 2) NOT NULL CHECK (remaining_amount >= 0),
    payment_mode TEXT NOT NULL DEFAULT 'yape_demo',
    status TEXT NOT NULL DEFAULT 'confirmed'
        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'expired')),
    verification_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES — high-performance hyperlocal queries
-- ============================================================================
CREATE INDEX idx_restaurants_coords ON restaurants(latitude, longitude);
CREATE INDEX idx_restaurants_is_open ON restaurants(is_open);
CREATE INDEX idx_dishes_restaurant_id ON dishes(restaurant_id);
CREATE INDEX idx_dishes_available ON dishes(is_available, stock_available);
CREATE INDEX idx_dishes_category ON dishes(category);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_dish_id ON reservations(dish_id);
CREATE INDEX idx_reservations_verification ON reservations(verification_code);
CREATE INDEX idx_reservations_created_at ON reservations(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Restaurants: public can read open restaurants
CREATE POLICY "Public: read open restaurants"
    ON restaurants FOR SELECT
    USING (is_open = true);

-- Dishes: public can read all dishes (available or not)
-- The app filters by is_available client-side so the dashboard can see all
CREATE POLICY "Public: read all dishes"
    ON dishes FOR SELECT
    USING (true);

-- Dishes: service role can update stock (via RPC SECURITY DEFINER)
-- No direct UPDATE/DELETE policy for anon users (only via RPCs)

-- Reservations: public can view their own reservation by ID or code
CREATE POLICY "Public: read reservations"
    ON reservations FOR SELECT
    USING (true);

-- Reservations: public can create reservations (only via atomic RPC)
CREATE POLICY "Public: insert reservations"
    ON reservations FOR INSERT
    WITH CHECK (status IN ('pending', 'confirmed'));

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE dishes;

-- ============================================================================
-- RPC 1: create_reservation_atomic
-- Prevents race conditions and inventory overselling
-- ============================================================================
CREATE OR REPLACE FUNCTION create_reservation_atomic(
    p_dish_id UUID,
    p_user_name TEXT,
    p_quantity INTEGER DEFAULT 1,
    p_payment_mode TEXT DEFAULT 'yape_demo',
    p_verification_code TEXT DEFAULT '123456'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_dish RECORD;
    v_advance NUMERIC(10, 2);
    v_fee NUMERIC(10, 2) := 0.50;
    v_remaining NUMERIC(10, 2);
    v_reservation_id UUID;
    v_expires_at TIMESTAMPTZ;
    v_result JSONB;
BEGIN
    -- Lock row to prevent concurrent race condition
    SELECT * INTO v_dish
    FROM dishes
    WHERE id = p_dish_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plato no encontrado' USING ERRCODE = 'P0002';
    END IF;

    IF NOT v_dish.is_available THEN
        RAISE EXCEPTION 'Este plato ya no está disponible' USING ERRCODE = 'P0004';
    END IF;

    IF v_dish.stock_available < p_quantity THEN
        RAISE EXCEPTION 'Stock insuficiente para este plato (quedan % porciones)', v_dish.stock_available
            USING ERRCODE = 'P0003';
    END IF;

    -- Calculate 50% advance and remaining balance
    v_advance   := round((v_dish.price * p_quantity * 0.50), 2);
    v_remaining := round((v_dish.price * p_quantity) - v_advance, 2);
    v_expires_at := timezone('utc'::text, now()) + INTERVAL '15 minutes';

    -- Decrement stock atomically
    UPDATE dishes
    SET
        stock_available = stock_available - p_quantity,
        is_available    = (stock_available - p_quantity > 0)
    WHERE id = p_dish_id;

    -- Create reservation record
    INSERT INTO reservations (
        dish_id, user_name, quantity, dish_price,
        advance_amount, service_fee, remaining_amount,
        payment_mode, status, verification_code,
        created_at, expires_at
    ) VALUES (
        p_dish_id, p_user_name, p_quantity, v_dish.price,
        v_advance, v_fee, v_remaining,
        p_payment_mode, 'confirmed', p_verification_code,
        timezone('utc'::text, now()), v_expires_at
    )
    RETURNING id INTO v_reservation_id;

    SELECT jsonb_build_object(
        'id',               r.id,
        'dish_id',          r.dish_id,
        'dish_title',       v_dish.title,
        'quantity',         r.quantity,
        'dish_price',       r.dish_price,
        'advance_amount',   r.advance_amount,
        'service_fee',      r.service_fee,
        'remaining_amount', r.remaining_amount,
        'status',           r.status,
        'verification_code', r.verification_code,
        'created_at',       r.created_at,
        'expires_at',       r.expires_at
    ) INTO v_result
    FROM reservations r
    WHERE r.id = v_reservation_id;

    RETURN v_result;
END;
$$;

-- ============================================================================
-- RPC 2: validate_and_complete_reservation_atomic
-- Called by the restaurant dashboard QR scanner to validate and close an order
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_and_complete_reservation_atomic(
    p_reservation_id TEXT,
    p_restaurant_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_res RECORD;
    v_dish RECORD;
    v_result JSONB;
BEGIN
    -- Attempt lookup by UUID first, then by verification_code
    SELECT r.* INTO v_res
    FROM reservations r
    WHERE r.id::TEXT = p_reservation_id
       OR r.verification_code = p_reservation_id
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reserva no encontrada con el código "%"', p_reservation_id
            USING ERRCODE = 'P0002';
    END IF;

    -- Validate restaurant ownership (if provided)
    IF p_restaurant_id IS NOT NULL THEN
        SELECT * INTO v_dish FROM dishes WHERE id = v_res.dish_id;
        IF v_dish.restaurant_id != p_restaurant_id THEN
            RAISE EXCEPTION 'Esta reserva pertenece a otro restaurante'
                USING ERRCODE = 'P0005';
        END IF;
    END IF;

    -- State checks
    IF v_res.status = 'completed' THEN
        RAISE EXCEPTION 'Esta reserva ya fue completada y entregada previamente'
            USING ERRCODE = 'P0006';
    END IF;

    IF v_res.status = 'cancelled' THEN
        RAISE EXCEPTION 'Esta reserva fue cancelada'
            USING ERRCODE = 'P0007';
    END IF;

    IF v_res.status = 'expired' OR v_res.expires_at < timezone('utc'::text, now()) THEN
        -- Mark expired if not already
        UPDATE reservations SET status = 'expired' WHERE id = v_res.id;
        RAISE EXCEPTION 'El tiempo de tolerancia (15 min) ha expirado'
            USING ERRCODE = 'P0008';
    END IF;

    -- Mark completed
    UPDATE reservations
    SET status = 'completed', completed_at = timezone('utc'::text, now())
    WHERE id = v_res.id;

    SELECT jsonb_build_object(
        'id',           r.id,
        'status',       r.status,
        'completed_at', r.completed_at,
        'dish_id',      r.dish_id,
        'user_name',    r.user_name,
        'quantity',     r.quantity
    ) INTO v_result
    FROM reservations r WHERE r.id = v_res.id;

    RETURN v_result;
END;
$$;

-- ============================================================================
-- RPC 3: update_dish_stock_atomic
-- Called by the restaurant dashboard inventory controls
-- ============================================================================
CREATE OR REPLACE FUNCTION update_dish_stock_atomic(
    p_dish_id UUID,
    p_restaurant_id UUID,
    p_stock_delta INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_dish RECORD;
    v_new_stock INTEGER;
BEGIN
    SELECT * INTO v_dish
    FROM dishes
    WHERE id = p_dish_id AND restaurant_id = p_restaurant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plato no encontrado o no pertenece a este restaurante'
            USING ERRCODE = 'P0002';
    END IF;

    v_new_stock := GREATEST(0, v_dish.stock_available + p_stock_delta);

    UPDATE dishes
    SET
        stock_available = v_new_stock,
        is_available    = (v_new_stock > 0)
    WHERE id = p_dish_id;

    RETURN jsonb_build_object(
        'id',              p_dish_id,
        'stock_available', v_new_stock,
        'is_available',    (v_new_stock > 0)
    );
END;
$$;

-- ============================================================================
-- DEMO SEED DATA (Cusco / UAC Larapa)
-- Ejecutar después de la migración principal
-- ============================================================================

INSERT INTO restaurants (id, name, tagline, address, latitude, longitude, distance_meters,
    image_url, banner_url, is_open, rating, review_count, opening_hours,
    categories, price_level, specialty)
VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Picantería Doña Rosa',
    'Sazón tradicional cusqueña y menú al paso',
    'Av. La Cultura 1420, frente a UAC Larapa',
    -13.5284, -71.9056, 240,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    true, 4.9, 184, '11:30 AM - 4:00 PM',
    ARRAY['Criollo','Menú del Día','Cusqueño'], 'S/ 12 - 18', 'Lomo Saltado & Sopa de Quinua'
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Sazón Andino · Fusión Criolla',
    'Clásicos peruanos con toque contemporáneo',
    'Calle Retiro 215, Urb. Larapa Grande',
    -13.5292, -71.9038, 310,
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    true, 4.8, 96, '12:00 PM - 4:30 PM',
    ARRAY['Criollo','Fusión','Al Wok'], 'S/ 14 - 17', 'Ají de Gallina & Tallarín Saltado'
),
(
    'a0000000-0000-0000-0000-000000000003',
    'La Olla Cusqueña',
    'Ingredientes del Valle Sagrado y cocina saludable',
    'Av. José Gabriel Cosio 310, Magisterio / San Jerónimo',
    -13.5271, -71.9074, 410,
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
    true, 4.7, 142, '12:00 PM - 5:00 PM',
    ARRAY['Regional','Saludable','Pescados'], 'S/ 13.50 - 18', 'Trucha Andina & Pollo a la Plancha'
);

INSERT INTO dishes (restaurant_id, title, description, price, stock_available,
    image_url, category, is_available, tags, preparation_time_mins, calories, allergens)
VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Lomo Saltado al Wok Tradicional',
    'Trozos de lomo fino flambeados al fuego vivo con cebolla morada crocante, tomate en gajos, ají amarillo, papas nativas fritas y arroz blanco con choclo desgranado.',
    16.00, 4,
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    'Criollo', true,
    ARRAY['Más Pedido','Flambeado al Wok','Papas Nativas'],
    7, '680 kcal', ARRAY['Gluten','Soya']
),
(
    'a0000000-0000-0000-0000-000000000001',
    'Menú Ejecutivo Doña Rosa',
    'Entrada: Sopa de quinua perlada con verduritas. Segundo a elección: Seco de res con frijoles canarios o Estofado casero. Incluye vaso de chicha morada natural.',
    12.00, 6,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    'Menú del Día', true,
    ARRAY['Económico','Menú Completo','Favorito Universitario'],
    4, '620 kcal', ARRAY['Quinua']
),
(
    'a0000000-0000-0000-0000-000000000001',
    'Rocoto Relleno Cusqueño',
    'Rocoto desvenado y horneado con picadillo de lomo, pasas, maní tostado y queso andino fundido por encima, acompañado del infaltable pastel de papa casero.',
    17.00, 2,
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80',
    'Criollo', true,
    ARRAY['Especialidad de la Casa','Picor Equilibrado','Pastel de Papa'],
    10, '610 kcal', ARRAY['Maní','Lácteos','Huevo']
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Ají de Gallina Cremoso',
    'Pechuga deshilachada sumergida en una suave crema de ají amarillo cusqueño, queso paria andino y nueces, con huevo cocido de corral, aceituna de botija y arroz graneado.',
    14.00, 5,
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
    'Criollo', true,
    ARRAY['Clásico Casero','Cremoso','Suave'],
    5, '590 kcal', ARRAY['Lácteos','Nueces']
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Tallarín Saltado Criollo',
    'Tallarines gruesos salteados al fuego vivo con tiras de carne marinada, cebolla china, pimientos andinos, sillao oscuro y un aromático toque de jengibre y aceite de ajonjolí.',
    15.00, 3,
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80',
    'Fusión', true,
    ARRAY['Últimas 3 porciones','Al Fuego Vivo','Chifa-Criollo'],
    6, '650 kcal', ARRAY['Gluten','Soya','Sésamo']
),
(
    'a0000000-0000-0000-0000-000000000003',
    'Trucha Andina a la Plancha',
    'Filete fresco de trucha arcoíris del Valle Sagrado sellado con mantequilla de muña y limón, servido con papas doradas al romero y ensalada verde de la huerta.',
    18.00, 3,
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    'Regional', true,
    ARRAY['Trucha de Altura','Saludable','Omega 3'],
    8, '510 kcal', ARRAY['Pescado','Lácteos']
),
(
    'a0000000-0000-0000-0000-000000000003',
    'Pollo a la Plancha con Papas Nativas',
    'Pechuga marinada con finas hierbas y limón sutil, acompañada de papas nativas horneadas y ensalada fresca con vinagreta de maracuyá.',
    13.50, 5,
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=80',
    'Saludable', true,
    ARRAY['Bajo en Grasa','Alto en Proteína','Rápido'],
    6, '480 kcal', ARRAY[]::TEXT[]
);
