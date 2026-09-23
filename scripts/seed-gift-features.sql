INSERT INTO products (category_id,name,slug,type,short_description,base_price,price_label,status,featured,customizable)
SELECT c.id,v.name,v.slug,'complement',v.description,v.price,'Desde','active',false,false
FROM categories c CROSS JOIN (VALUES
  ('Tarjeta de dedicatoria','tarjeta-dedicatoria','Tarjeta para acompañar un arreglo',2500),
  ('Chocolates artesanales','chocolates-artesanales','Caja de chocolates para acompañar el regalo',7500),
  ('Globo de celebración','globo-celebracion','Globo para cumpleaños y celebraciones',4500)
) AS v(name,slug,description,price)
WHERE c.slug='complementos'
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name,short_description=EXCLUDED.short_description,base_price=EXCLUDED.base_price,status='active',updated_at=now();
--> statement-breakpoint
INSERT INTO product_variants (product_id,name,price)
SELECT p.id,'Estándar',p.base_price FROM products p
WHERE p.slug IN ('tarjeta-dedicatoria','chocolates-artesanales','globo-celebracion')
AND NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id=p.id);
--> statement-breakpoint
INSERT INTO product_complement_recommendations (floral_product_id,complement_product_id,sort_order)
SELECT f.id,c.id,row_number() OVER (PARTITION BY f.id ORDER BY c.slug)-1
FROM products f CROSS JOIN products c
WHERE f.slug IN ('ramo-aurora','rosas-de-amor','luz-de-primavera','jardin-rosado')
AND c.slug IN ('tarjeta-dedicatoria','chocolates-artesanales','globo-celebracion')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO combos (name,slug,description,image_url,price,promotional_price,featured,active)
VALUES ('Celebración luminosa','celebracion-luminosa','Girasoles, chocolates y tarjeta para celebrar.','/home-sunflowers.webp',36000,34000,true,true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,image_url=EXCLUDED.image_url,price=EXCLUDED.price,promotional_price=EXCLUDED.promotional_price,featured=true,active=true,updated_at=now();
--> statement-breakpoint
INSERT INTO combo_items (combo_id,product_id,quantity)
SELECT c.id,p.id,1 FROM combos c CROSS JOIN products p
WHERE c.slug='celebracion-luminosa' AND p.slug IN ('luz-de-primavera','chocolates-artesanales','tarjeta-dedicatoria')
AND NOT EXISTS (SELECT 1 FROM combo_items ci WHERE ci.combo_id=c.id AND ci.product_id=p.id);
