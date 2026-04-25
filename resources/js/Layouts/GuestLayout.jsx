import { Link, usePage } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50">
            {/* Main Content */}
            <main className="pt-8">
                {children}
            </main>


        </div>
    );
}
