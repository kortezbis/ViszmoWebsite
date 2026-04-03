export const PageLayout = ({ children, paddingTop = "pt-24", showFooterGradient = true }: any) => {
    return (
        <div className={`min-h-screen relative overflow-hidden bg-slate-50 ${paddingTop}`}>
            {showFooterGradient && (
                <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            )}
            {children}
        </div>
    );
};

export const PageSection = ({ children, width = "default", className = "" }: any) => {
    const maxWidthClass = width === "full" ? "max-w-full" : "max-w-7xl";
    return (
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClass} ${className} relative z-10`}>
            {children}
        </div>
    );
};
