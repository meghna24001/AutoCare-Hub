import { Router, Request, Response } from 'express';
import { queryAll, queryOne, executeRun } from '../db/database.js';

export const invoiceRouter = Router();

// GET all invoices
invoiceRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT 
        i.invoice_number as invoiceNumber,
        i.service_id as serviceID,
        i.customer_id as customerID,
        i.vehicle_id as vehicleID,
        i.invoice_date as invoiceDate,
        i.due_date as dueDate,
        i.labour_charges as labourCharges,
        i.spare_parts_cost as sparePartsCost,
        i.subtotal,
        i.discount,
        i.tax_amount as taxAmount,
        i.total_amount as totalAmount,
        i.paid_amount as paidAmount,
        i.payment_status as paymentStatus,
        i.payment_method as paymentMethod,
        i.paid_at as paidAt,
        i.notes,
        c.customer_name as customerName,
        c.mobile_number as customerMobile,
        c.email_address as customerEmail,
        v.registration_number as vehicleRegistration,
        v.model as vehicleModel,
        s.service_type as serviceType
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.customer_id
      LEFT JOIN vehicles v ON i.vehicle_id = v.vehicle_id
      LEFT JOIN service_jobs s ON i.service_id = s.service_id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (status) {
      sql += ' AND i.payment_status = ?';
      params.push(status);
    }

    sql += ' ORDER BY i.created_at DESC';

    const invoices = await queryAll(sql, params);
    res.json({ success: true, data: invoices });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single invoice details with payment history
invoiceRouter.get('/:invoiceNumber', async (req: Request, res: Response) => {
  try {
    const invoiceNum = req.params.invoiceNumber.trim();
    const invoice = await queryOne(`
      SELECT 
        i.invoice_number as invoiceNumber,
        i.service_id as serviceID,
        i.customer_id as customerID,
        i.vehicle_id as vehicleID,
        i.invoice_date as invoiceDate,
        i.due_date as dueDate,
        i.labour_charges as labourCharges,
        i.spare_parts_cost as sparePartsCost,
        i.subtotal,
        i.discount,
        i.tax_amount as taxAmount,
        i.total_amount as totalAmount,
        i.paid_amount as paidAmount,
        i.payment_status as paymentStatus,
        i.payment_method as paymentMethod,
        i.paid_at as paidAt,
        i.notes,
        c.customer_name as customerName,
        c.mobile_number as customerMobile,
        c.email_address as customerEmail,
        c.address as customerAddress,
        v.registration_number as vehicleRegistration,
        v.model as vehicleModel,
        v.manufacturer as vehicleMake,
        s.service_type as serviceType,
        s.service_date as serviceDate,
        m.name as mechanicName
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.customer_id
      LEFT JOIN vehicles v ON i.vehicle_id = v.vehicle_id
      LEFT JOIN service_jobs s ON i.service_id = s.service_id
      LEFT JOIN mechanics m ON s.mechanic_id = m.mechanic_id
      WHERE i.invoice_number = ?
    `, [invoiceNum]);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const payments = await queryAll(`
      SELECT 
        payment_id as paymentId,
        invoice_number as invoiceNumber,
        amount,
        payment_method as paymentMethod,
        transaction_reference as transactionReference,
        paid_at as paidAt,
        notes
      FROM payments
      WHERE invoice_number = ?
      ORDER BY payment_id ASC
    `, [invoiceNum]);

    res.json({
      success: true,
      data: {
        ...invoice,
        balanceDue: Math.max(0, invoice.totalAmount - invoice.paidAmount),
        payments,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST record payment against invoice
// 100% Free - Records local transaction and calculates paid / balance status
invoiceRouter.post('/:invoiceNumber/pay', async (req: Request, res: Response) => {
  try {
    const invoiceNum = req.params.invoiceNumber.trim();
    const { amount, paymentMethod, transactionReference = '', notes = '' } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }

    const invoice = await queryOne<{ total_amount: number; paid_amount: number }>(
      'SELECT total_amount, paid_amount FROM invoices WHERE invoice_number = ?',
      [invoiceNum]
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const newPaidAmount = (invoice.paid_amount || 0) + numAmount;
    let paymentStatus = 'Partially Paid';
    if (newPaidAmount >= invoice.total_amount) {
      paymentStatus = 'Paid';
    }

    const nowStr = new Date().toISOString();

    // 1. Record transaction in payments table
    await executeRun(`
      INSERT INTO payments (invoice_number, amount, payment_method, transaction_reference, paid_at, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [invoiceNum, numAmount, paymentMethod || 'UPI', transactionReference, nowStr, notes]);

    // 2. Update invoice status
    await executeRun(`
      UPDATE invoices SET
        paid_amount = ?,
        payment_status = ?,
        payment_method = ?,
        paid_at = ?
      WHERE invoice_number = ?
    `, [newPaidAmount, paymentStatus, paymentMethod || 'UPI', nowStr, invoiceNum]);

    res.json({
      success: true,
      message: `Payment of ₹${numAmount.toLocaleString('en-IN')} recorded successfully.`,
      data: {
        invoiceNumber: invoiceNum,
        paidAmount: newPaidAmount,
        totalAmount: invoice.total_amount,
        balanceDue: Math.max(0, invoice.total_amount - newPaidAmount),
        paymentStatus,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET zero-cost standard NPCI UPI Intent & WhatsApp links
invoiceRouter.get('/:invoiceNumber/payment-links', async (req: Request, res: Response) => {
  try {
    const invoiceNum = req.params.invoiceNumber.trim();
    const invoice = await queryOne<{
      total_amount: number;
      paid_amount: number;
      customer_name: string;
      mobile_number: string;
    }>(`
      SELECT i.total_amount, i.paid_amount, c.customer_name, c.mobile_number
      FROM invoices i
      JOIN customers c ON i.customer_id = c.customer_id
      WHERE i.invoice_number = ?
    `, [invoiceNum]);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const balance = Math.max(0, invoice.total_amount - invoice.paid_amount);

    // 1. Free NPCI UPI URI Scheme (works with GPay, PhonePe, Paytm, BHIM without merchant fees)
    const upiUri = `upi://pay?pa=autocarehub@okhdfcbank&pn=AutoCare%20Hub&am=${balance.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoiceNum}`)}`;

    // 2. Free WhatsApp Web notification URL
    const cleanMobile = invoice.mobile_number.replace(/\D/g, '').slice(-10);
    const message = `Hello ${invoice.customer_name}, your vehicle service invoice ${invoiceNum} from AutoCare Hub is ready. Total: ₹${invoice.total_amount.toLocaleString('en-IN')}, Balance Due: ₹${balance.toLocaleString('en-IN')}. Pay via UPI: ${upiUri}`;
    const whatsappUrl = `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(message)}`;

    res.json({
      success: true,
      data: {
        invoiceNumber: invoiceNum,
        balanceDue: balance,
        upiUri,
        whatsappUrl,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
