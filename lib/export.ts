// Utilitaires pour exporter les données en CSV

// Exporter des données en CSV
export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  if (data.length === 0) {
    console.warn('Aucune donnée à exporter')
    return
  }

  // Utiliser les headers fournis ou les clés du premier objet
  const csvHeaders = headers || Object.keys(data[0])
  
  // Créer les lignes CSV
  const csvRows = [
    // Headers
    csvHeaders.map(h => escapeCSVValue(h)).join(','),
    // Data rows
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header]
        return escapeCSVValue(value)
      }).join(',')
    ),
  ]

  const csvContent = csvRows.join('\n')
  
  // Créer le blob et télécharger
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }) // BOM pour Excel
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}


// Échapper les valeurs CSV (gérer les virgules, guillemets, retours à la ligne)
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)
  
  // Si la valeur contient une virgule, des guillemets ou un retour à la ligne, l'entourer de guillemets
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Échapper les guillemets en les doublant
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

// Formater une date pour CSV
export function formatDateForCSV(date: string | Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Formater un montant pour CSV
export function formatCurrencyForCSV(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0,00'
  return amount.toFixed(2).replace('.', ',')
}

// Exporter des factures
export function exportInvoices(invoices: any[], filename: string = 'factures') {
  const headers = [
    'Numéro',
    'Date',
    'Échéance',
    'Client',
    'Sous-total',
    'TVA',
    'Total',
    'Statut',
    'Notes',
  ]

  const data = invoices.map(invoice => ({
    'Numéro': invoice.invoiceNumber,
    'Date': formatDateForCSV(invoice.date),
    'Échéance': formatDateForCSV(invoice.dueDate),
    'Client': `${invoice.client.firstName} ${invoice.client.lastName}`,
    'Sous-total': formatCurrencyForCSV(invoice.subtotal),
    'TVA': formatCurrencyForCSV(invoice.tax),
    'Total': formatCurrencyForCSV(invoice.total),
    'Statut': invoice.status,
    'Notes': invoice.notes || '',
  }))

  exportToCSV(data, filename, headers)
}

// Exporter des clients
export function exportClients(clients: any[], filename: string = 'clients') {
  const headers = [
    'Prénom',
    'Nom',
    'Email',
    'Téléphone',
    'Adresse',
    'Ville',
    'Code postal',
    'Notes',
  ]

  const data = clients.map(client => ({
    'Prénom': client.firstName,
    'Nom': client.lastName,
    'Email': client.email || '',
    'Téléphone': client.phone,
    'Adresse': client.address || '',
    'Ville': client.city || '',
    'Code postal': client.postalCode || '',
    'Notes': client.notes || '',
  }))

  exportToCSV(data, filename, headers)
}

// Exporter des interventions
export function exportInterventions(interventions: any[], filename: string = 'interventions') {
  const headers = [
    'Titre',
    'Date',
    'Client',
    'Adresse',
    'Statut',
    'Prix',
    'Durée (min)',
    'Description',
  ]

  const data = interventions.map(intervention => ({
    'Titre': intervention.title,
    'Date': formatDateForCSV(intervention.date),
    'Client': `${intervention.client.firstName} ${intervention.client.lastName}`,
    'Adresse': intervention.address || '',
    'Statut': intervention.status,
    'Prix': formatCurrencyForCSV(intervention.price),
    'Durée (min)': intervention.duration || '',
    'Description': intervention.description || '',
  }))

  exportToCSV(data, filename, headers)
}

// Exporter des dépenses
export function exportExpenses(expenses: any[], filename: string = 'depenses') {
  const headers = [
    'Description',
    'Catégorie',
    'Montant',
    'Date',
  ]

  const data = expenses.map(expense => ({
    'Description': expense.description,
    'Catégorie': expense.category,
    'Montant': formatCurrencyForCSV(expense.amount),
    'Date': formatDateForCSV(expense.date),
  }))

  exportToCSV(data, filename, headers)
}

// Exporter des devis
export function exportQuotes(quotes: any[], filename: string = 'devis') {
  const headers = [
    'Numéro',
    'Date',
    'Valide jusqu\'au',
    'Client',
    'Sous-total',
    'TVA',
    'Total',
    'Statut',
    'Notes',
  ]

  const data = quotes.map(quote => ({
    'Numéro': quote.quoteNumber,
    'Date': formatDateForCSV(quote.date),
    'Valide jusqu\'au': formatDateForCSV(quote.validUntil),
    'Client': `${quote.client.firstName} ${quote.client.lastName}`,
    'Sous-total': formatCurrencyForCSV(quote.subtotal),
    'TVA': formatCurrencyForCSV(quote.tax),
    'Total': formatCurrencyForCSV(quote.total),
    'Statut': quote.status,
    'Notes': quote.notes || '',
  }))

  exportToCSV(data, filename, headers)
}

