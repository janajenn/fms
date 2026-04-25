import { Dialog } from 'primereact/dialog';
import { Link } from '@inertiajs/react';

export default function LoginPromptModal({ isOpen, onClose, productName, returnUrl }) {
    return (
        <Dialog
            header={null}
            visible={isOpen}
            onHide={onClose}
            style={{ width: '380px', maxWidth: '90vw' }}
            className="login-prompt-modal"
            closable={false}
        >
            <div className="text-center p-5">
                {/* Small Icon */}
                <div className="mb-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6-4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zm10 5H8a2 2 0 00-2 2v2h12v-2a2 2 0 00-2-2z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-orange-500 mb-1">
                    Login Required
                </h3>

                {/* Message */}
                <p className="text-sm text-white mb-4">
                    Log in to add <span className="font-medium text-orange-500">"{productName}"</span> to your cart
                </p>

                {/* Benefits - Compact List */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <ul className="space-y-1 text-xs">
                        <li className="flex items-center gap-1.5 text-gray-600">
                            <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Save cart & track orders
                        </li>
                        <li className="flex items-center gap-1.5 text-gray-600">
                            <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Faster checkout
                        </li>
                        <li className="flex items-center gap-1.5 text-gray-600">
                            <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Exclusive offers
                        </li>
                    </ul>
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 text-sm rounded-full border border-gray-300 text-white hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <Link
                        href={route('login', { redirect: returnUrl })}
                        className="flex-1 py-2 text-sm bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors text-center"
                    >
                        Login
                    </Link>
                </div>
            </div>

            <style jsx>{`
                .login-prompt-modal :global(.p-dialog) {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                    border: none;
                }

                .login-prompt-modal :global(.p-dialog .p-dialog-content) {
                    padding: 0;
                    background: white;
                    border-radius: 20px;
                    border: none;
                }

                .login-prompt-modal :global(.p-dialog .p-dialog-header) {
                    display: none;
                }
            `}</style>
        </Dialog>
    );
}
