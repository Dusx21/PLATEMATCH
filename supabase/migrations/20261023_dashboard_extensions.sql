-- ============================================================================
-- PLATEMATCH V2 - DASHBOARD EXTENSIONS MIGRATION
-- ExpoAndina - Doña Rosa Restaurant Operations & Validation
-- ============================================================================

-- Function to validate and complete a reservation atomically from the restaurant dashboard
CREATE OR REPLACE FUNCTION validate_and_complete_reservation_atomic(
    p_reservation_id UUID,
    p_restaurant_id UUID
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
    -- Lock reservation for update
    SELECT * INTO v_res
    FROM reservations
    WHERE id = p_reservation_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reserva no encontrada con ID %', p_reservation_id USING ERRCODE = 'P0002';
    END IF;

    -- Verify dish & restaurant association
    SELECT * INTO v_dish
    FROM dishes
    WHERE id = v_res.dish_id;

    IF v_dish.restaurant_id != p_restaurant_id THEN
        RAISE EXCEPTION 'Esta reserva pertenece a otro restaurante y no puede ser validada aquí' USING ERRCODE = 'P0005';
    END IF;

    -- Check status
    IF v_res.status = 'completed' THEN
        RAISE EXCEPTION 'Esta reserva ya fue completada y entregada previamente' USING ERRCODE = 'P0006';
    END IF;

    IF v_res.status = 'cancelled' THEN
        RAISE EXCEPTION 'Esta reserva fue cancelada previamente' USING ERRCODE = 'P0007';
    END IF;

    IF v_res.status = 'expired' OR v_res.expires_at < timezone('utc'::text, now()) THEN
        UPDATE reservations SET status = 'expired' WHERE id = p_reservation_id;
        RAISE EXCEPTION 'El tiempo de tolerancia (15 min) ha expirado' USING ERRCODE = 'P0008';
    END IF;

    -- Mark as completed
    UPDATE reservations
    SET status = 'completed',
        completed_at = timezone('utc'::text, now())
    WHERE id = p_reservation_id;

    SELECT jsonb_build_object(
        'id', r.id,
        'dish_id', r.dish_id,
        'dish_title', v_dish.title,
        'quantity', r.quantity,
        'user_name', r.user_name,
        'dish_price', r.dish_price,
        'advance_amount', r.advance_amount,
        'remaining_amount', r.remaining_amount,
        'status', 'completed',
        'created_at', r.created_at,
        'completed_at', timezone('utc'::text, now())
    ) INTO v_result
    FROM reservations r
    WHERE r.id = p_reservation_id;

    RETURN v_result;
END;
$$;

-- Function to adjust dish stock atomically from the restaurant dashboard
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
    v_result JSONB;
BEGIN
    SELECT * INTO v_dish
    FROM dishes
    WHERE id = p_dish_id AND restaurant_id = p_restaurant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plato no encontrado o no autorizado' USING ERRCODE = 'P0002';
    END IF;

    v_new_stock := GREATEST(0, v_dish.stock_available + p_stock_delta);

    UPDATE dishes
    SET stock_available = v_new_stock,
        is_available = (v_new_stock > 0)
    WHERE id = p_dish_id;

    SELECT jsonb_build_object(
        'id', id,
        'title', title,
        'stock_available', stock_available,
        'is_available', is_available
    ) INTO v_result
    FROM dishes
    WHERE id = p_dish_id;

    RETURN v_result;
END;
$$;
