-- Remove sample users
DELETE FROM "users" WHERE "id" IN (
    'f22f076c-135c-407b-a7d1-3d9f0aefc5fd',
    'b8d8c61f-999b-462c-a0d9-7d2837b565e4',
    'dfa0e28a-73ca-4820-8a2b-cf82ba74ac12',
    'e1ce7266-c8f8-4921-ac8a-7a2b897b7a25',
    '273b556a-3d7d-4528-ab78-58a7a5befa2c'
); 