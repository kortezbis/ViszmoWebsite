import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Pricing } from '../components/Pricing';
import { PricingFAQ } from '../components/PricingFAQ';

export const PricingPage = () => {
    return (
        <div className="min-h-screen bg-[#ffffff] font-sans text-slate-900 selection:bg-[#0ea5e9]/10 flex flex-col">
            <Navbar />

            <main className="flex-1 relative pt-24">
                {/* Background (Shared) */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20">
                    <div className="absolute inset-0 bg-[#ffffff]" />
                    <div
                        className="absolute inset-0 opacity-[0.4]"
                        style={{
                            backgroundImage: `linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0ea5e9]/5 blur-[120px]" />
                    <div className="absolute top-[10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-slate-500/5 blur-[120px]" />
                </div>

                <Pricing />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
                    <PricingFAQ />
                </div>

                {/* Bottom Fade Wrapper */}
                <div className="relative isolate mt-auto w-full">
                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-[#d6dee8] -z-10 pointer-events-none" />
                </div>
            </main>

            <Footer />
        </div>
    );
};
