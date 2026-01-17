export const downloadCSV = (data, filename = 'export') => {
    if (!data || data.length === 0) {
        alert("No data to export");
        return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]).filter(k => !k.startsWith('_')); // Exclude internal fields if any
    const csvRows = [headers.join(',')];

    data.forEach(row => {
        const values = headers.map(h => {
            let val = row[h];
            // Handle objects/arrays
            if (typeof val === 'object' && val !== null) {
                // Try to make it readable if it's a simple object, otherwise JSON stringify
                try {
                    val = JSON.stringify(val).replace(/"/g, '""'); 
                } catch (e) {
                    val = '';
                }
            } else {
                 // Handle strings with commas or quotes
                 val = String(val || '').replace(/"/g, '""');
            }
           
            return `"${val}"`;
        });
        csvRows.push(values.join(','));
    });

    const content = csvRows.join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
