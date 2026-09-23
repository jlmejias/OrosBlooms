INSERT INTO site_settings (key,value) VALUES (
  'business',
  '{"email":"hola@orosblooms.test","phone":"+1 (805) 555-0147","whatsapp":"18055550147","instagram":"https://example.com/orosblooms-instagram","facebook":"https://example.com/orosblooms-facebook","hours":"Lunes a sábado, 9:00 a. m. a 6:00 p. m. (horario de prueba)","deliveryArea":"Oxnard, California","deliveryNotice":"La disponibilidad y el costo de entrega se confirman al preparar la cotización.","depositPercent":50,"cancellationPolicy":"Política de cancelación y devoluciones pendiente de aprobación.","privacyRetention":"Plazo de conservación pendiente de aprobación."}'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now();
