<?php

return [
    'secret_key' => env('PAYMONGO_SECRET_KEY'),
    'public_key' => env('PAYMONGO_PUBLIC_KEY'),
    'webhook_secret' => env('PAYMONGO_WEBHOOK_SECRET'),
    'mode' => env('PAYMONGO_MODE', 'sandbox'),
    'base_url' => env('PAYMONGO_MODE', 'sandbox') === 'sandbox'
        ? 'https://api.paymongo.com/v1'
        : 'https://api.paymongo.com/v1',
];
