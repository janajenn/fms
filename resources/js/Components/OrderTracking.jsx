import { useState, useEffect } from 'react';
import { Package, Settings, Truck, CheckCircle, XCircle } from 'lucide-react';

export default function OrderTracking({ status, createdAt, estimatedDelivery }) {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const steps = [
        {
            key: 'pending',
            label: 'Order Placed',
            Icon: Package,
            description: 'Your order has been received',
            color: 'text-amber-500',
            bgColor: 'bg-amber-500',
            borderColor: 'border-amber-500'
        },
        {
            key: 'processing',
            label: 'Processing',
            Icon: Settings,
            description: 'Your order is being prepared',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500',
            borderColor: 'border-blue-500'
        },
        {
            key: 'shipped',
            label: 'Shipped',
            Icon: Truck,
            description: 'Your order is on the way',
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500',
            borderColor: 'border-indigo-500'
        },
        {
            key: 'completed',
            label: 'Delivered',
            Icon: CheckCircle,
            description: 'Your order has been delivered',
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500',
            borderColor: 'border-emerald-500'
        }
    ];

    // Map order status to step index
    const getStatusIndex = (status) => {
        const statusMap = {
            'pending': 0,
            'processing': 1,
            'shipped': 2,
            'completed': 3,
            'cancelled': -1
        };
        return statusMap[status] ?? 0;
    };

    useEffect(() => {
        const stepIndex = getStatusIndex(status);
        setCurrentStep(stepIndex);
        if (stepIndex >= 0) {
            setProgress((stepIndex / (steps.length - 1)) * 100);
        } else {
            setProgress(0);
        }
    }, [status]);

    const getStepStatus = (index) => {
        if (status === 'cancelled') {
            return 'cancelled';
        }
        if (index < currentStep) return 'completed';
        if (index === currentStep) return 'current';
        return 'pending';
    };

    const formatDate = (date) => {
        if (!date) return 'Pending';
        return new Date(date).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (status === 'cancelled') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 text-center">
                <XCircle className="w-10 h-10 md:w-12 md:h-12 text-red-500 mx-auto mb-2" />
                <h3 className="text-red-800 font-semibold text-sm md:text-base mb-1">Order Cancelled</h3>
                <p className="text-red-600 text-xs md:text-sm">This order has been cancelled.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Progress Bar - Hidden on mobile, visible on desktop */}
            <div className="hidden sm:block relative mb-6 md:mb-8">
                <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Steps - Responsive grid */}
            <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-4">
                {steps.map((step, index) => {
                    const stepStatus = getStepStatus(index);
                    const IconComponent = step.Icon;

                    return (
                        <div key={step.key} className="relative">
                            <div className="flex flex-col items-center text-center">
                                {/* Icon Circle - Responsive sizing */}
                                <div className={`
                                    relative z-10
                                    w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12
                                    rounded-full flex items-center justify-center
                                    transition-all duration-300
                                    ${stepStatus === 'completed' ? step.bgColor + ' text-white' : ''}
                                    ${stepStatus === 'current' ? 'bg-white border-2 ' + step.borderColor + ' ' + step.color : ''}
                                    ${stepStatus === 'pending' ? 'bg-stone-100 text-stone-400' : ''}
                                    ${stepStatus === 'cancelled' ? 'bg-red-100 text-red-500' : ''}
                                `}>
                                    {stepStatus === 'completed' ? (
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                    ) : (
                                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                    )}
                                </div>

                                {/* Label - Responsive text sizes */}
                                <div className="mt-1 sm:mt-1.5 md:mt-2">
                                    <p className={`
                                        text-[10px] sm:text-xs md:text-sm font-semibold
                                        leading-tight
                                        ${stepStatus === 'completed' ? 'text-stone-800' : ''}
                                        ${stepStatus === 'current' ? step.color : ''}
                                        ${stepStatus === 'pending' ? 'text-stone-400' : ''}
                                    `}>
                                        {step.label}
                                    </p>
                                    {/* Description - Hidden on mobile, visible on desktop */}
                                    <p className="hidden md:block text-[10px] md:text-xs text-stone-400 mt-0.5">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Date for completed steps - Responsive */}
                                {stepStatus === 'completed' && index === currentStep - 1 && (
                                    <p className="text-[8px] sm:text-[10px] text-stone-400 mt-0.5 sm:mt-1">
                                        {formatDate(createdAt)}
                                    </p>
                                )}
                            </div>

                            {/* Connector Line - Hidden on mobile, visible on desktop */}
                            {index < steps.length - 1 && (
                                <div className="hidden sm:block absolute top-4 sm:top-5 md:top-6 left-1/2 w-full h-0.5 -translate-y-1/2">
                                    <div className={`
                                        h-full transition-all duration-300
                                        ${index < currentStep ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-stone-200'}
                                    `} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile Progress Indicator - Shows current step */}
            {isMobile && (
                <div className="mt-4 pt-3 border-t border-stone-100">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500">Progress:</span>
                        <span className="font-medium text-amber-600">
                            {steps[currentStep]?.label || 'Order Placed'}
                        </span>
                        <span className="text-stone-500">{Math.round(progress)}%</span>
                    </div>
                </div>
            )}

            {/* Estimated Delivery Date - Responsive */}
            {estimatedDelivery && (
                <div className="mt-4 sm:mt-5 md:mt-6 p-2 sm:p-3 md:p-4 bg-amber-50 rounded-lg text-center">
                    <p className="text-[10px] sm:text-xs text-amber-600 font-medium">Estimated Delivery Date</p>
                    <p className="text-xs sm:text-sm font-semibold text-amber-700">
                        {new Date(estimatedDelivery).toLocaleDateString('en-PH', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
                </div>
            )}
        </div>
    );
}
