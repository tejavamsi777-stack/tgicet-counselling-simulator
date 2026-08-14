INSERT INTO exams (slug, short_name, name, description, is_active)
VALUES
  ('tg-eapcet', 'TG EAPCET', 'Telangana Engineering, Agriculture & Pharmacy Common Entrance Test', 'Awaiting verified data import.', false),
  ('tg-pgecet', 'TG PGECET', 'Telangana Post Graduate Engineering Common Entrance Test', 'Awaiting verified data import.', false),
  ('tg-edcet', 'TG EDCET', 'Telangana Education Common Entrance Test', 'Awaiting verified data import.', false),
  ('tg-ecet', 'TG ECET', 'Telangana Engineering Common Entrance Test', 'Awaiting verified data import.', false),
  ('tg-lawcet', 'TG LAWCET', 'Telangana Law Common Entrance Test', 'Awaiting verified data import.', false),
  ('tg-polycet', 'TG POLYCET', 'Telangana Polytechnic Common Entrance Test', 'Awaiting verified data import.', false),
  ('ts-cpget', 'TS CPGET', 'Telangana Common Post Graduate Entrance Tests', 'Awaiting verified data import.', false),
  ('ts-pglcet', 'TS PGLCET', 'Telangana Post Graduate Law Common Entrance Test', 'Awaiting verified data import.', false),
  ('ts-pecet', 'TS PECET', 'Telangana Physical Education Common Entrance Test', 'Awaiting verified data import.', false)
ON CONFLICT (slug) DO NOTHING;
