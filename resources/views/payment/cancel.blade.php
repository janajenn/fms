<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Cancelled - A' Arfeels</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
        <p class="text-gray-600 mb-6">You cancelled the payment. No charges were made.</p>

        <a href="{{ route('payment.initiate', $order) }}"
           class="inline-block w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition text-center">
            Try Again
        </a>

        <a href="{{ route('customer.orders.show', $order) }}"
           class="inline-block w-full text-gray-500 py-2 mt-2 hover:text-gray-700 transition text-center">
            Back to Order
        </a>
    </div>
</body>
</html>
