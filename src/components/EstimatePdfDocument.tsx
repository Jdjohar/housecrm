'use client';

import React from 'react';
import { ShieldCheck, Phone, Mail, Globe, MapPin } from 'lucide-react';

interface EstimatePdfDocumentProps {
  estimate: any;
  customer?: any;
  settings?: any;
}

export default function EstimatePdfDocument({
  estimate,
  customer,
  settings,
}: EstimatePdfDocumentProps) {
  if (!estimate) return null;

  const customerData = customer || estimate.customer || {};
  const custName = estimate.customerName || customerData.name || 'Valued Client';
  const custAddress = customerData.address || 'Property Address';
  const custCity = customerData.city || 'Lower Mainland';
  const custPostal = customerData.postalCode || 'BC';
  const custPhone = estimate.customerPhone || customerData.phone || 'N/A';
  const custEmail = estimate.customerEmail || customerData.email || 'N/A';

  const issueDate = estimate.createdAt
    ? new Date(estimate.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const validUntil = estimate.expiryDate
    ? new Date(estimate.expiryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date(Date.now() + 30 * 24 * 3600 * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const docType = estimate.invoiceNumber || estimate.docType === 'invoice' ? 'INVOICE' : estimate.jobNumber || estimate.docType === 'job' ? 'WORK ORDER' : 'ESTIMATE';
  const docNumber = estimate.invoiceNumber || estimate.jobNumber || estimate.estimateNumber || 'EST-0001';

  const dateLabel = docType === 'INVOICE' ? 'Due Date:' : docType === 'WORK ORDER' ? 'Service Date:' : 'Valid Until:';
  const secondaryDate = docType === 'INVOICE' && estimate.dueDate
    ? new Date(estimate.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : docType === 'WORK ORDER' && estimate.scheduledDate
    ? `${new Date(estimate.scheduledDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} @ ${estimate.scheduledTime || '10:00 AM'}`
    : validUntil;

  const subtotal = Number(estimate.subtotal) || 0;
  const discount = Number(estimate.discount) || 0;
  const tax = Number(estimate.tax) || 0;
  const total =
    Number(estimate.total) ||
    Number(estimate.totalAmount) ||
    Number((subtotal + tax - discount).toFixed(2)) ||
    0;
  const depositPaid = Number(estimate.depositPaid) || 0;
  const amountPaid = Number(estimate.amountPaid) || depositPaid || 0;
  const balanceDue =
    estimate.balanceDue !== undefined && estimate.balanceDue !== null
      ? Number(estimate.balanceDue)
      : Math.max(0, Number((total - amountPaid).toFixed(2)));
  const depositOwner = estimate.depositCollectedBy || estimate.paymentCollectedBy || '';
  const depositMethod = estimate.depositPaymentMethod || estimate.paymentMethod || '';

  return (
    <div
      id="printable-estimate-doc"
      className="bg-white text-slate-800 p-8 sm:p-10 max-w-[850px] mx-auto text-xs leading-relaxed print:p-2 print:max-w-none print:w-full print:text-[11px] font-sans shadow-sm border border-slate-200 print:border-none print:shadow-none"
    >
      {/* Top Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
        {/* Left: Brand Logo & Mascot */}
        <div className="flex items-center space-x-3.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0f2744] via-[#1a365d] to-[#2563eb] text-white flex flex-col items-center justify-center font-black shadow-md border border-slate-700">
            <span className="text-xl tracking-tighter leading-none">H&H</span>
            <span className="text-[7px] tracking-widest uppercase font-semibold text-blue-200">PROS</span>
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-[#0f2744] uppercase leading-tight">
              H & H HOUSE MAINTENANCE LTD.
            </div>
            <div className="text-[11px] font-semibold text-slate-600 tracking-wide">
              Professional Property Services
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Pressure Washing • Roof & Gutters • Window Cleaning • Fencing
            </div>
          </div>
        </div>

        {/* Right: Title & Meta */}
        <div className="text-right">
          <h1 className="text-3xl font-black text-[#0f2744] tracking-tight mb-1">
            {docType}
          </h1>
          <div className="text-xs font-bold text-slate-800">
            {docType === 'INVOICE' ? 'Invoice #' : docType === 'WORK ORDER' ? 'Job #' : 'Estimate #'}:{' '}
            <span className="font-mono text-blue-700">{docNumber}</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Issue Date: <span className="font-medium text-slate-900">{issueDate}</span>
          </div>
          <div className="text-[11px] text-slate-600">
            {dateLabel} <span className="font-medium text-slate-900">{secondaryDate}</span>
          </div>
          {docType === 'WORK ORDER' && estimate.assignedCrew && (
            <div className="text-[11px] text-slate-600">
              Assigned Crew: <span className="font-semibold text-slate-900">{estimate.assignedCrew}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bill To & Company Info (2 Column Box) */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
        {/* Left: Bill To */}
        <div className="space-y-1 pr-2">
          <div className="font-black text-[#0f2744] text-[11px] uppercase tracking-wider mb-1">
            BILL TO
          </div>
          <div className="font-bold text-slate-900 text-sm">{custName}</div>
          <div className="text-slate-600">{custAddress}</div>
          <div className="text-slate-600">{custCity}, {custPostal}</div>
          <div className="text-slate-600 pt-0.5">
            <span className="font-semibold text-slate-700">Phone:</span> {custPhone}
          </div>
          <div className="text-slate-600">
            <span className="font-semibold text-slate-700">Email:</span> {custEmail}
          </div>
        </div>

        {/* Right: H&H Info */}
        <div className="space-y-1 pl-2 border-l border-slate-200">
          <div className="font-black text-[#0f2744] text-[11px] uppercase tracking-wider mb-1">
            H & H HOUSE MAINTENANCE LTD.
          </div>
          <div className="text-slate-700 font-medium">
            <span className="font-bold text-slate-900">Charanjeet Brar:</span> 604-781-0546
          </div>
          <div className="text-slate-700 font-medium">
            <span className="font-bold text-slate-900">Manpreet Gill:</span> 778-829-5911
          </div>
          <div className="text-slate-700 font-medium">
            <span className="font-bold text-slate-900">Email:</span> info@hnhpros.ca
          </div>
          <div className="text-slate-700 font-medium">
            <span className="font-bold text-slate-900">Website:</span> www.hnhpros.ca
          </div>
          <div className="text-slate-600 font-medium">Lower Mainland & Fraser Valley, BC</div>
        </div>
      </div>

      {/* Service Address Box */}
      <div className="bg-slate-50 rounded-lg p-2.5 px-4 border border-slate-200 mb-5 flex items-center justify-between">
        <span className="font-black text-[#0f2744] text-[11px] uppercase tracking-wider">
          SERVICE ADDRESS:
        </span>
        <span className="font-bold text-slate-900 text-xs">
          {custAddress}, {custCity}, {custPostal}
        </span>
      </div>

      {/* Items Table */}
      <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0f2744] text-white text-[11px] uppercase font-bold tracking-wider">
              <th className="py-2.5 px-4 w-[55%]">DESCRIPTION</th>
              <th className="py-2.5 px-3 text-center w-[10%]">QTY</th>
              <th className="py-2.5 px-4 text-right w-[15%]">RATE</th>
              <th className="py-2.5 px-4 text-right w-[20%]">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {estimate.items && estimate.items.length > 0 ? (
              estimate.items.map((item: any, idx: number) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.service}</div>
                    {item.description && (
                      <div className="text-[11px] text-slate-500 mt-0.5 whitespace-pre-line">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-700">
                    {item.quantity || 1}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    ${(Number(item.unitPrice) || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ${(Number(item.total) || 0).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-400">
                  No items listed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="flex justify-end mb-6">
        <div className="w-80 space-y-1.5 text-xs text-slate-700">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="font-medium">Subtotal</span>
            <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700 font-medium">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}

          {tax > 0 ? (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="font-medium">GST ({settings?.gstRate || 5}%)</span>
              <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
            </div>
          ) : (
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-400">
              <span className="font-medium">GST</span>
              <span>No Tax (0%)</span>
            </div>
          )}

          <div className="flex justify-between py-2 bg-blue-50/80 px-3 rounded-lg border border-blue-200 text-sm font-black text-[#0f2744]">
            <span>TOTAL AMOUNT</span>
            <span className="text-blue-700">${total.toFixed(2)}</span>
          </div>

          {/* Payment History / Receipts / Deposit */}
          {estimate.payments && estimate.payments.length > 0 ? (
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <div className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                Payments Received:
              </div>
              {estimate.payments.map((p: any, pIdx: number) => (
                <div key={pIdx} className="flex justify-between text-[11px] py-1 px-2 rounded-md bg-emerald-50/80 border border-emerald-100 text-emerald-800 font-medium">
                  <div>
                    <div className="font-semibold">✓ {new Date(p.paymentDate || p.createdAt).toLocaleDateString()} ({p.paymentMethod || 'e-Transfer'})</div>
                    {p.collectedBy && (
                      <div className="text-[10px] text-emerald-600">Held by: {p.collectedBy}</div>
                    )}
                  </div>
                  <span className="font-bold">-${Number(p.amount).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 bg-amber-50 px-3 rounded-lg border border-amber-200 text-xs font-black text-amber-900 mt-1.5">
                <span>BALANCE DUE:</span>
                <span>${balanceDue.toFixed(2)}</span>
              </div>
            </div>
          ) : amountPaid > 0 ? (
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <div className="flex justify-between py-1.5 px-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                <div>
                  <div className="font-bold flex items-center gap-1">
                    <span>✓ Deposit Received</span>
                  </div>
                  {depositOwner ? (
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      Held by: {depositOwner}{depositMethod ? ` • ${depositMethod}` : ''}
                    </div>
                  ) : null}
                </div>
                <span className="font-black text-sm text-emerald-700">-${amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 bg-amber-50 px-3 rounded-lg border border-amber-200 text-xs font-black text-amber-900">
                <span>{docType === 'WORK ORDER' ? 'BALANCE DUE ON SERVICE:' : 'BALANCE DUE:'}</span>
                <span>${balanceDue.toFixed(2)}</span>
              </div>
            </div>
          ) : docType === 'WORK ORDER' ? (
            <div className="pt-2 border-t border-slate-200 space-y-1">
              <div className="flex justify-between py-1 text-slate-500 text-[11px]">
                <span>Deposit Received</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between py-2 bg-amber-50 px-3 rounded-lg border border-amber-200 text-xs font-black text-amber-900">
                <span>BALANCE DUE ON SERVICE:</span>
                <span>${balanceDue.toFixed(2)}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Two-Column Notes Box */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Work Scope */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="font-black text-[#0f2744] text-[11px] uppercase tracking-wider">
            WORK SCOPE &amp; TERMS
          </div>
          <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
            <li>Service guaranteed per H&amp;H professional standards.</li>
            <li>Additional requests or extra scope quoted separately.</li>
            <li>Customer water &amp; electrical access provided on site.</li>
          </ul>
        </div>

        {/* Service Notes */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="font-black text-[#0f2744] text-[11px] uppercase tracking-wider">
            SERVICE &amp; ACCESS NOTES
          </div>
          <div className="text-[11px] text-slate-600 leading-relaxed">
            {estimate.customerNotes || estimate.notes || 'Professional property maintenance by licensed & insured specialists.'}
          </div>
          <div className="text-[11px] font-bold text-slate-800 pt-1">
            Thank you for choosing H &amp; H House Maintenance Ltd.
          </div>
        </div>
      </div>

      {/* Dynamic Action Banner based on docType */}
      {docType === 'WORK ORDER' ? (
        <div className="bg-[#0f2744] text-white p-4 rounded-xl mb-6 text-center space-y-1">
          <div className="font-black text-sm tracking-wide text-emerald-300">
            CONFIRMED BOOKING &amp; WORK ORDER
          </div>
          <div className="text-xs text-slate-200">
            Scheduled for <span className="font-bold text-white">{secondaryDate}</span> with <span className="font-bold text-white">{estimate.assignedCrew || 'H&H Service Crew'}</span>
          </div>
          <div className="text-[11px] text-blue-300">
            Questions or Rescheduling? Call <span className="font-bold text-white">604-781-0546</span> / <span className="font-bold text-white">778-829-5911</span> or email <span className="font-bold text-white">info@hnhpros.ca</span>
          </div>
        </div>
      ) : docType === 'INVOICE' ? (
        <div className="bg-[#0f2744] text-white p-4 rounded-xl mb-6 text-center space-y-1">
          <div className="font-black text-sm tracking-wide text-amber-300">
            PAYMENT INSTRUCTIONS
          </div>
          <div className="text-xs text-slate-200">
            Please send Interac e-Transfer to <span className="font-bold text-white">info@hnhpros.ca</span> (Auto-Deposit enabled)
          </div>
          <div className="text-[11px] text-blue-300">
            Reference Invoice #{docNumber} in transfer notes. Thank you for your business!
          </div>
        </div>
      ) : (
        <div className="bg-[#0f2744] text-white p-4 rounded-xl mb-6 text-center space-y-1">
          <div className="font-black text-sm tracking-wide text-amber-300">
            READY TO APPROVE?
          </div>
          <div className="text-xs text-slate-200">
            Contact us at <span className="font-bold text-white">604-781-0546</span> / <span className="font-bold text-white">778-829-5911</span> or <span className="font-bold text-white">info@hnhpros.ca</span>
          </div>
          <div className="text-[11px] text-blue-300">
            Or approve directly online in 1-click via your client portal link
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500 space-y-1">
        <div className="font-bold text-slate-700">
          H & H HOUSE MAINTENANCE LTD. • Pressure Washing • Roof & Gutter Cleaning • Window Cleaning • Lawn Care • Fencing
        </div>
        <div>
          Residential • Commercial • Strata | Lower Mainland, BC | www.hnhpros.ca
        </div>
      </div>
    </div>
  );
}
