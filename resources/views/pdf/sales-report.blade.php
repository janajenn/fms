<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Monthly Sales Summary</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #f59e0b;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            color: #1f2937;
        }
        .header p {
            margin: 5px 0 0;
            color: #6b7280;
        }
        .year-section {
            margin-bottom: 25px;
        }
        .year-title {
            background-color: #fef3c7;
            padding: 6px 12px;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
        }
        .summary-table th, .summary-table td {
            border: 1px solid #e5e7eb;
            padding: 8px 10px;
        }
        .summary-table th {
            background-color: #f3f4f6;
            font-weight: 600;
            text-align: center;
        }
        .summary-table td:first-child {
            text-align: left;
            font-weight: bold;
        }
        .summary-table td:not(:first-child) {
            text-align: right;
        }
        .summary-table td:nth-child(2),
        .summary-table td:nth-child(4),
        .summary-table td:nth-child(5) {
            text-align: center;
        }
        .year-total {
            background-color: #fef3c7;
            font-weight: bold;
        }
        .grand-total {
            margin-top: 20px;
            background-color: #1f2937;
            color: white;
            padding: 10px;
            border-radius: 6px;
            text-align: center;
        }
        .footer {
            margin-top: 25px;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Monthly Sales Summary</h1>
        <p>A' Arfeels Trading</p>
        <p>Generated: {{ $generatedAt }}</p>
    </div>

    @php
        // Group monthlyData by year
        $years = [];
        foreach ($monthlyData as $month) {
            $year = \Carbon\Carbon::createFromFormat('F Y', $month['month'])->year;
            $years[$year][] = $month;
        }
    @endphp

    @foreach($years as $year => $months)
        <div class="year-section">
            <div class="year-title">{{ $year }}</div>
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Orders</th>
                        <th>Total Sales (₱)</th>
                        <th>COD</th>
                        <th>GCash</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($months as $month)
                    <tr>
                        <td>{{ $month['month'] }}</td>
                        <td style="text-align: center;">{{ $month['order_count'] }}</td>
                        <td style="text-align: right;">₱{{ number_format($month['total_sales'], 2) }}</td>
                        <td style="text-align: center;">{{ $month['payment_methods']['cod'] }}</td>
                        <td style="text-align: center;">{{ $month['payment_methods']['gcash'] }}</td>
                    </tr>
                    @endforeach
                </tbody>
                @php
                    $yearOrders = array_sum(array_column($months, 'order_count'));
                    $yearSales = array_sum(array_column($months, 'total_sales'));
                    $yearCod = array_sum(array_column(array_column($months, 'payment_methods'), 'cod'));
                    $yearGcash = array_sum(array_column(array_column($months, 'payment_methods'), 'gcash'));
                @endphp
                <tfoot>
                    <tr class="year-total">
                        <td><strong>Year {{ $year }} Total</strong></td>
                        <td style="text-align: center;"><strong>{{ $yearOrders }}</strong></td>
                        <td style="text-align: right;"><strong>₱{{ number_format($yearSales, 2) }}</strong></td>
                        <td style="text-align: center;"><strong>{{ $yearCod }}</strong></td>
                        <td style="text-align: center;"><strong>{{ $yearGcash }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    @endforeach

    <div class="grand-total">
        <div style="display: flex; justify-content: space-between;">
            <span>🏆 GRAND TOTAL (All Years)</span>
            <span>Orders: {{ $grandTotals['total_orders'] }}</span>
            <span>Sales: ₱{{ number_format($grandTotals['total_sales'], 2) }}</span>
            <span>COD: {{ $grandTotals['cod_count'] }}</span>
            <span>GCash: {{ $grandTotals['gcash_count'] }}</span>
        </div>
    </div>

    <div class="footer">
        Summary of monthly sales. Detailed order information can be obtained from the admin panel.
    </div>
</body>
</html>
