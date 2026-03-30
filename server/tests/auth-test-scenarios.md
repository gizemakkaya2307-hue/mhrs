# Auth Test Senaryolari

- Yanlış şifre: `POST /api/auth/login` 401 + `success:false`
- Kayıtlı email: `POST /api/auth/register` 409 + açıklayıcı mesaj
- Boş input: register/login 400 doğrulama hatası
- Invalid email: 400 doğrulama hatası
- Kısa/zayıf şifre: 400 doğrulama hatası
- Başarılı login: 200 + `data.accessToken`, `data.refreshToken`, `data.user`
- Başarılı register: 201 + kullanıcı bilgisi
- Refresh token başarı: 200 + yeni access token
- Refresh token hatalı: 401
