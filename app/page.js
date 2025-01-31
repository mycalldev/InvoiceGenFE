'use client'

import { useState, useEffect } from "react";
import Image from "next/image";
import { jsPDF } from "jspdf";
import styles from "./page.module.css";

export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState({
    customerName: "",
    items: [{ name: "", hours: 0, pricePerHour: 0 }],
    invoiceNumber: "INV-001",
    date: new Date().toISOString().split("T")[0],
  });
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    fetch("/logo.png")
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoBase64(reader.result);
        reader.readAsDataURL(blob);
      });
  }, []);

  const addItem = () => {
    setInvoice({ ...invoice, items: [...invoice.items, { name: "", hours: 0, pricePerHour: 0 }] });
  };

  const handleChange = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index][field] = value;
    setInvoice({ ...invoice, items: newItems });
  };

  const totalInvoicePrice = invoice.items.reduce((sum, item) => sum + item.hours * item.pricePerHour, 0);

  const generatePDF = () => {
    const pdf = new jsPDF();
    if (logoBase64) {
      pdf.addImage(logoBase64, "PNG", 10, 10, 50, 50);
    }

    pdf.setFontSize(16);
    pdf.text("Mycall Dev Tech", 140, 20, { align: "right" });
    pdf.setFontSize(12);
    pdf.text("Location: London", 140, 30, { align: "right" });
    pdf.text("Website: www.mycalldevtech.com", 140, 40, { align: "right" });
    pdf.text("Email: devmycall@gmail.com", 140, 50, { align: "right" });
    pdf.text("Mobile: 07754987116", 140, 60, { align: "right" });

    pdf.setFontSize(18);
    pdf.text("Invoice", 10, 80);
    pdf.setFontSize(12);
    pdf.text(`Invoice #: ${invoice.invoiceNumber}`, 10, 90);
    pdf.text(`Date: ${invoice.date}`, 10, 100);
    pdf.text(`Customer: ${invoice.customerName}`, 10, 110);

    let yPos = 130;
    pdf.text("Items:", 10, yPos);
    yPos += 10;
    invoice.items.forEach((item, index) => {
      pdf.text(`${index + 1}. Item Name: ${item.name}`, 10, yPos);
      yPos += 10;
      pdf.text(`   Hours Worked: ${item.hours}`, 10, yPos);
      yPos += 10;
      pdf.text(`   Price Per Hour: £${item.pricePerHour.toFixed(2)}`, 10, yPos);
      yPos += 10;
      pdf.text(`   Total: £${(item.hours * item.pricePerHour).toFixed(2)}`, 10, yPos);
      yPos += 15;
    });
    pdf.text(`Total Invoice Price: £${totalInvoicePrice.toFixed(2)}`, 10, yPos);
    pdf.save("invoice.pdf");
  };

  return (
    <div className={styles.container}>
      <Image src="/logo.png" alt="Company Logo" width={150} height={150} className={styles.logo} />
      <h2 className={styles.title}>Mycall Dev Tech</h2>
      <div className={styles.inputGroup}>
        <label>Customer Name:</label>
        <input
          type="text"
          className={styles.input}
          value={invoice.customerName}
          onChange={(e) => setInvoice({ ...invoice, customerName: e.target.value })}
        />
      </div>
      <div className={styles.inputGroup}>
        <label>Invoice Number:</label>
        <input
          type="text"
          className={styles.input}
          value={invoice.invoiceNumber}
          onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
        />
      </div>
      <div className={styles.inputGroup}>
        <label>Date:</label>
        <input
          type="date"
          className={styles.input}
          value={invoice.date}
          onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
        />
      </div>
      <h3 className={styles.subtitle}>Items</h3>
      {invoice.items.map((item, index) => (
        <div key={index} className={styles.itemRow}>
          <label>Item Name:</label>
          <input
            type="text"
            className={styles.input}
            value={item.name}
            onChange={(e) => handleChange(index, "name", e.target.value)}
          />
          <label>Hours Worked:</label>
          <input
            type="number"
            className={styles.input}
            value={item.hours}
            onChange={(e) => handleChange(index, "hours", parseInt(e.target.value))}
          />
          <label>Price Per Hour (£):</label>
          <input
            type="number"
            className={styles.input}
            value={item.pricePerHour}
            onChange={(e) => handleChange(index, "pricePerHour", parseFloat(e.target.value))}
          />
        </div>
      ))}
      <h3 className={styles.total}>Total Invoice Price: £{totalInvoicePrice.toFixed(2)}</h3>
      <button onClick={addItem} className={styles.addButton}>+ Add Item</button>
      <button onClick={generatePDF} className={styles.downloadButton}>Download PDF</button>
    </div>
  );
}
