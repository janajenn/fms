<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Stock Movement Ledger | A' Arfeels Trading</title>
    <style>
        /* RESET & GLOBAL */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #e9ecef;   /* only on screen, prints white */
            font-family: 'IBM Plex Sans', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            font-size: 9.5pt;
            line-height: 1.45;
            color: #1e2a3a;
            padding: 1.8rem 1rem;
        }

        /* A4 PRINT MARGINS (clean & crisp) */
        @page {
            size: A4;
            margin: 2cm 1.8cm;
        }

        /* MAIN REPORT CONTAINER — no card, no shadows, pure white background */
        .report {
            max-width: 1100px;
            margin: 0 auto;
            background: white;
        }

        /* HEADER SECTION — two column layout */
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            flex-wrap: wrap;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 12px;
            margin-bottom: 28px;
        }

        .company-info h1 {
            font-size: 20pt;
            font-weight: 600;
            letter-spacing: -0.3px;
            color: #1e466e;
            margin-bottom: 4px;
        }

        .company-info .sub {
            font-size: 8pt;
            color: #5d6f83;
            letter-spacing: 0.3px;
        }

        .report-id {
            text-align: right;
            font-size: 8.5pt;
            background: #f4f7fc;
            padding: 8px 16px;
            border-radius: 4px;
        }

        .report-id .label {
            font-weight: 600;
            color: #1e466e;
            text-transform: uppercase;
            font-size: 7.5pt;
        }

        /* TITLE & METADATA */
        .title-block {
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            flex-wrap: wrap;
            border-left: 4px solid #c2410c;
            padding-left: 14px;
        }

        .title-block h2 {
            font-size: 16pt;
            font-weight: 500;
            color: #0f2b3d;
        }

        .stats {
            font-size: 8.5pt;
            background: #f0f3f8;
            padding: 4px 12px;
            border-radius: 20px;
            color: #2c5a7a;
        }

        /* TABLE DESIGN — clean, alternating rows, subtle borders */
        .table-wrapper {
            margin: 1.8rem 0 1.2rem;
            border: 1px solid #dce5ec;
        }

        .stock-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.8pt;
        }

        .stock-table th {
            background: #f0f4fa;
            color: #1e3a5f;
            padding: 12px 8px;
            font-weight: 600;
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            border-bottom: 1px solid #cbdbe0;
            text-align: left;
        }

        .stock-table td {
            padding: 10px 8px;
            border-bottom: 0.5px solid #e2e9f0;
            color: #2c4258;
            vertical-align: top;
        }

        /* alternating row colors for better readability */
        .stock-table tbody tr:nth-child(even) {
            background-color: #fafcff;
        }

        .stock-table tbody tr:nth-child(odd) {
            background-color: #ffffff;
        }

        .stock-table tbody tr:hover {
            background: #fef5e7;
        }

        /* TYPE BADGES — simple, professional, no rounded cards */
        .type-label {
            display: inline-block;
            font-weight: 700;
            font-size: 7.5pt;
            padding: 2px 8px;
            border-radius: 12px;
            letter-spacing: 0.3px;
            text-transform: uppercase;
            background: #eef2f7;
            color: #2c3e50;
        }

        .type-label.in {
            background: #e0f0e6;
            color: #136b47;
            border-left: 2px solid #2c9b6e;
        }

        .type-label.out {
            background: #ffe6e3;
            color: #b13e3e;
            border-left: 2px solid #dc6b6b;
        }

        .type-label.order {
            background: #e9e4ff;
            color: #4c2d91;
            border-left: 2px solid #8a6de9;
        }

        .type-label.adjustment {
            background: #e2f0fa;
            color: #1f6c9e;
            border-left: 2px solid #4299c1;
        }

        .type-label.return {
            background: #fff0e4;
            color: #b45a2b;
            border-left: 2px solid #e29654;
        }

        /* numeric columns */
        .text-center {
            text-align: center;
        }

        .col-qty, .col-before, .col-after {
            font-weight: 500;
            font-variant-numeric: tabular-nums;
        }

        .product-name {
            font-weight: 500;
            color: #1c3a5c;
        }

        .size-sub {
            font-size: 7pt;
            color: #6f8aac;
            margin-left: 4px;
        }

        .reason-text {
            color: #4a627a;
            font-size: 7.8pt;
        }

        .user-name {
            font-weight: 450;
            background: none;
            display: inline;
        }

        /* FOOTER — simple, legal lines */
        .report-footer {
            margin-top: 28px;
            padding-top: 12px;
            border-top: 1px solid #d0dbe8;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            font-size: 7pt;
            color: #5f7d9c;
        }

        .footer-left span {
            margin-right: 20px;
        }

        .page-info {
            font-family: monospace;
        }

        .watermark-note {
            text-align: center;
            font-size: 6.5pt;
            color: #8ca3c0;
            margin-top: 10px;
        }

        /* Column widths — better spacing */
        .col-date { width: 14%; }
        .col-product { width: 21%; }
        .col-type { width: 9%; }
        .col-qty { width: 7%; text-align: center; }
        .col-before { width: 7%; text-align: center; }
        .col-after { width: 7%; text-align: center; }
        .col-reason { width: 21%; }
        .col-user { width: 12%; }

        /* PRINT OPTIMIZATION */
        @media print {
            body {
                background: white;
                padding: 0;
                margin: 0;
            }
            .report {
                max-width: 100%;
                margin: 0;
            }
            .type-label {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            .stock-table th {
                background: #eef2f7;
                print-color-adjust: exact;
            }
            .stock-table tbody tr:nth-child(even) {
                background-color: #fafcff;
                print-color-adjust: exact;
            }
            .report-id {
                background: #f4f7fc;
                print-color-adjust: exact;
            }
            .stats {
                background: #f0f3f8;
                print-color-adjust: exact;
            }
        }

        /* small screen */
        @media (max-width: 700px) {
            .report-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
            }
            .report-id {
                text-align: left;
            }
            .title-block {
                flex-direction: column;
                gap: 8px;
            }
        }
    </style>
</head>
<body>
<div class="report">
    <!-- header with company and generation info -->
    <div class="report-header">
        <div class="company-info">
            <h1>A' ARFEELS TRADING</h1>
            <div class="sub">Premium Wood Furniture · Cagayan de Oro, Philippines</div>
        </div>
        <div class="report-id">
            <div class="label">REPORT DATE & TIME</div>
            <div>{{ $generated_at->format('F d, Y') }} | {{ $generated_at->format('h:i A') }}</div>
        </div>
    </div>

    <!-- title & stats -->
    <div class="title-block">
        <h2>Stock Movement Logs</h2>
        <div class="stats">
            📋 Total records: {{ $logs->count() }}
        </div>
    </div>

    <!-- stock table -->
    <div class="table-wrapper">
        <table class="stock-table">
            <thead>
                <tr>
                    <th class="col-date">Date & Time</th>
                    <th class="col-product">Product</th>
                    <th class="col-type">Type</th>
                    <th class="col-qty">Qty</th>
                    <th class="col-before">Before</th>
                    <th class="col-after">After</th>
                    <th class="col-reason">Reason / Reference</th>
                    <th class="col-user">User</th>
                </tr>
            </thead>
            <tbody>
                @forelse($logs as $log)
                <tr>
                    <td class="col-date">{{ $log->created_at->format('Y-m-d H:i') }}</td>
                    <td class="col-product">
                        <span class="product-name">{{ $log->product?->name ?? 'N/A' }}</span>
                        @if($log->size_label)
                            <span class="size-sub">({{ $log->size_label }})</span>
                        @endif
                    </td>
                    <td class="col-type">
                        <span class="type-label {{ $log->type }}">
                            {{ strtoupper($log->type) }}
                        </span>
                    </td>
                    <td class="col-qty text-center">{{ $log->quantity }}</td>
                    <td class="col-before text-center">{{ $log->stock_before }}</td>
                    <td class="col-after text-center">{{ $log->stock_after }}</td>
                    <td class="col-reason"><span class="reason-text">{{ $log->reason ?? '—' }}</span></td>
                    <td class="col-user"><span class="user-name">{{ $log->user?->name ?? 'System' }}</span></td>
                </tr>
                @empty
                <tr>
                    <td colspan="8" style="text-align: center; padding: 3rem; color: #8ba0b8;">
                        No stock movement records found.
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- footer -->
    <div class="report-footer">
        <div class="footer-left">
            <span>🔒 System-generated inventory ledger</span>
            <span>📧 inventory@aarfeels.com</span>
            <span>© {{ date('Y') }} A' Arfeels Trading</span>
        </div>
        <div class="page-info">
            Document ID: STK-{{ now()->format('YmdHis') }}
        </div>
    </div>
    <div class="watermark-note">
        This is an official stock movement report — digitally verified records
    </div>
</div>
</body>
</html>
