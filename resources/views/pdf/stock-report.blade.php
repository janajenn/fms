<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Stock Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica', 'DejaVu Sans', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.5;
            color: #333;
            background: white;
        }

        @page {
            size: A4;
            margin: 2cm 1.5cm;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 12px;
            border-bottom: 1px solid #ddd;
        }

        .company-name {
            font-size: 14pt;
            font-weight: 600;
            color: #1a1a2e;
            margin-bottom: 4px;
        }

        .report-title {
            font-size: 12pt;
            font-weight: 500;
            color: #555;
            margin-top: 8px;
        }

        .report-date {
            font-size: 8pt;
            color: #999;
            margin-top: 4px;
        }

        /* Stats Row - Simple Horizontal */
        .stats-row {
            display: flex;
            border: 1px solid #e0e0e0;
            margin-bottom: 25px;
        }

        .stat {
            flex: 1;
            text-align: center;
            padding: 12px 8px;
            border-right: 1px solid #e0e0e0;
        }

        .stat:last-child {
            border-right: none;
        }

        .stat-label {
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #888;
            margin-bottom: 6px;
        }

        .stat-value {
            font-size: 16pt;
            font-weight: 600;
            color: #2c3e50;
        }

        /* Table */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
        }

        .data-table th {
            background: #f5f5f5;
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #555;
            border-bottom: 1px solid #ddd;
        }

        .data-table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
            color: #444;
        }

        .data-table tr:last-child td {
            border-bottom: none;
        }

        /* Status Badges - Simple */
        .status {
            display: inline-block;
            padding: 2px 8px;
            font-size: 7.5pt;
            border-radius: 12px;
        }

        .status-in-stock {
            background: #e8f5e9;
            color: #2e7d32;
        }

        .status-low-stock {
            background: #fff3e0;
            color: #e65100;
        }

        .status-out-stock {
            background: #ffebee;
            color: #c62828;
        }

        .text-center {
            text-align: center;
        }

        .font-medium {
            font-weight: 500;
        }

        /* Footer */
        .footer {
            margin-top: 25px;
            padding-top: 10px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 7pt;
            color: #aaa;
        }

        /* Column Widths */
        .col-product { width: 30%; }
        .col-category { width: 15%; }
        .col-size { width: 18%; }
        .col-stock { width: 10%; text-align: center; }
        .col-alert { width: 10%; text-align: center; }
        .col-status { width: 12%; }
    </style>
</head>
<body>
    <div>
        <!-- Header -->
        <div class="header">
            <div class="company-name">A' ARFEELS TRADING</div>
            <div class="report-title">Product Stock Report</div>
            <div class="report-date">{{ $generated_at->format('F d, Y') }}</div>
        </div>



        <!-- Table -->
        <table class="data-table">
            <thead>
                <tr>
                    <th class="col-product">Product</th>
                    <th class="col-category">Category</th>
                    <th class="col-size">Size / Variant</th>
                    <th class="col-stock">Stock</th>
                    <th class="col-alert">Min Alert</th>
                    <th class="col-status">Status</th>
                </tr>
            </thead>
            <tbody>
                @forelse($products as $product)
                <tr>
                    <td>{{ $product->product_name }}</td>
                    <td>{{ $product->category_name }}</td>
                    <td>{{ $product->size_variant }}</td>
                    <td class="text-center font-medium">{{ number_format($product->current_stock) }}</td>
                    <td class="text-center">{{ number_format($product->min_alert) }}</td>
                    <td>
                        <span class="status status-{{ $product->status_color === 'green' ? 'in-stock' : ($product->status_color === 'yellow' ? 'low-stock' : 'out-stock') }}">
                            {{ $product->status }}
                        </span>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        No products found
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <!-- Footer -->
        <div class="footer">
            <div>Generated by A' Arfeels Trading Inventory System</div>
            <div>&copy; {{ date('Y') }} A' Arfeels Trading</div>
        </div>
    </div>
</body>
</html>
