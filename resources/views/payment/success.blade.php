<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful - A' Arfeels</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p class="text-gray-600 mb-6">Your order has been confirmed. A confirmation email has been sent to you.</p>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <p class="text-sm text-gray-500">Order Number</p>
            <p class="text-lg font-semibold text-gray-800">{{ $order->order_number }}</p>
            <p class="text-sm text-gray-500 mt-2">Total Amount</p>
            <p class="text-xl font-bold text-green-600">₱{{ number_format($order->total_price, 2) }}</p>
        </div>

        <a href="{{ route('customer.orders.show', $order) }}"
           class="inline-block w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition text-center">
            View My Order
        </a>

        <a href="{{ route('products.index') }}"
           class="inline-block w-full text-gray-500 py-2 mt-2 hover:text-gray-700 transition text-center">
            Continue Shopping
        </a>
    </div>
</body>
</html>
