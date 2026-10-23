-- ============================================================================
-- PLATEMATCH V2 - SUPABASE SEED DATA (CUSCO - EXPOANDINA DEMO)
-- All coordinates are situated in Cusco, Peru (around UAC Larapa / San Jerónimo)
-- ============================================================================

-- RESTAURANTS (3 Local Cusqueño Establishments)
INSERT INTO restaurants (id, name, address, distance_meters, latitude, longitude, image_url, is_open, rating, review_count)
VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'Picantería Doña Rosa',
    'Av. La Cultura 1420, San Jerónimo (frente a UAC)',
    280,
    -13.5284,
    -71.9056,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    true,
    4.9,
    184
),
(
    'a1000000-0000-0000-0000-000000000002',
    'Sazón Andino · Fusión Criolla',
    'Calle Retiro 215, Urb. Larapa Grande',
    340,
    -13.5292,
    -71.9038,
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    true,
    4.8,
    96
),
(
    'a1000000-0000-0000-0000-000000000003',
    'La Olla Cusqueña',
    'Av. José Gabriel Cosio 310, Magisterio',
    420,
    -13.5271,
    -71.9074,
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
    true,
    4.7,
    142
);

-- DISHES (7 Curated Culinary Offerings)
INSERT INTO dishes (id, restaurant_id, title, description, price, stock_available, image_url, category, is_available, tags, preparation_time_mins)
VALUES
(
    'b1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Lomo Saltado al Wok Tradicional',
    'Trozos de lomo fino salteados al wok con cebolla morada, tomate crocante, ají amarillo, papas nativas fritas y arroz con choclo.',
    16.00,
    4,
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    'Criollo',
    true,
    ARRAY['Popular', 'Plato Fuerte', 'Reserva Rápida'],
    7
),
(
    'b1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Menú Ejecutivo Doña Rosa',
    'Entrada: Sopa de quinua cusqueña. Segundo: Seco de res con frijoles canarios o Estofado de pollo. Incluye refresco de chicha morada.',
    12.00,
    6,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    'Menú del Día',
    true,
    ARRAY['Económico', 'Menú Completo', 'Universitario'],
    4
),
(
    'b1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    'Ají de Gallina Cremoso',
    'Pechuga deshilachada en crema de ají amarillo cusqueño con queso paria, nueces, huevo de corral, aceituna botija y arroz graneado.',
    14.00,
    5,
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
    'Criollo',
    true,
    ARRAY['Clásico', 'Casero'],
    5
),
(
    'b1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    'Tallarín Saltado Criollo',
    'Tallarines salteados al fuego vivo con tiras de carne marinada, cebolla china, pimientos andinos, sillao oscuro y toque ahumado.',
    15.00,
    3,
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80',
    'Fusión',
    true,
    ARRAY['Últimas Porciones', 'Al Wok'],
    6
),
(
    'b1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003',
    'Trucha Andina a la Plancha',
    'Filete fresco de trucha del Valle Sagrado sellado con mantequilla de muña y hierbas andinas, guarnición de papas doradas y ensalada fresca.',
    18.00,
    3,
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    'Regional',
    true,
    ARRAY['Saludable', 'Trucha de Altura', 'Favorito'],
    8
),
(
    'b1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003',
    'Pollo a la Plancha con Papas Nativas',
    'Filete de pechuga macerado en romero y limón sutil, acompañado de crocantes chips de papas nativas cusqueñas y ensalada de palta.',
    13.50,
    5,
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=80',
    'Saludable',
    true,
    ARRAY['Bajo en Grasas', 'Rápido'],
    6
),
(
    'b1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Rocoto Relleno Cusqueño',
    'Rocoto seleccionado con relleno artesanal de carne picada, pasas, maní y hierbas aromáticas, cubierto con queso fundido y pastel de papa.',
    17.00,
    2,
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80',
    'Criollo',
    true,
    ARRAY['Especialidad', 'Picante Moderado'],
    10
);
