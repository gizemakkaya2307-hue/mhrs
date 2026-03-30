import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div>
                    <h1 className="text-9xl font-black text-indigo-200">404</h1>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Sayfa Bulunamadı
                    </h2>
                    <p className="mt-4 text-base text-gray-500">
                        Aradığınız tıbbi kayıt veya sayfa sunucularımızda mevcut değil.
                    </p>
                </div>
                <div className="mt-6">
                    <Link
                        to="/"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
