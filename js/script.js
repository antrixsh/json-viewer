document.addEventListener('DOMContentLoaded', (event) => {
    // Ensure the correct input method is displayed on page load
    document.querySelector('input[name="inputMethod"][value="file"]').checked = true;
    document.getElementById('fileInput').style.display = 'block';
    document.getElementById('jsonInput').style.display = 'none';
    document.getElementById('jsonInput').value = ''; // Clear text area
    document.getElementById('fileInput').value = ''; // Clear file input
    document.getElementById('fileName').textContent = 'No file chosen'; // Reset file name display

    document.getElementById('fileInput').addEventListener('change', function() {
        const fileName = this.files.length ? this.files[0].name : 'No file chosen';
        document.getElementById('fileName').textContent = fileName;
    });
});

document.querySelectorAll('input[name="inputMethod"]').forEach(input => {
    input.addEventListener('change', () => {
        const selectedMethod = document.querySelector('input[name="inputMethod"]:checked').value;
        if (selectedMethod === 'file') {
            document.getElementById('fileInput').style.display = 'block';
            document.getElementById('jsonInput').style.display = 'none';
            document.getElementById('jsonInput').value = '';  // Clear text area when switching to file input
        } else {
            document.getElementById('fileInput').style.display = 'none';
            document.getElementById('jsonInput').style.display = 'block';
            document.getElementById('fileInput').value = '';  // Clear file input when switching to text area
            document.getElementById('fileName').textContent = 'No file chosen';  // Reset file name display
        }
    });
});

document.getElementById('viewButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const jsonInput = document.getElementById('jsonInput');
    let jsonData;

    if (fileInput.style.display === 'block' && fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                jsonData = JSON.parse(e.target.result);
                displayJsonAsTable(jsonData);
                document.getElementById('clearButton').style.display = 'block';
            } catch (error) {
                alert('Invalid JSON file.');
            }
        };
        reader.readAsText(fileInput.files[0]);
    } else if (jsonInput.style.display === 'block' && jsonInput.value.trim()) {
        try {
            jsonData = JSON.parse(jsonInput.value.trim());
            displayJsonAsTable(jsonData);
            document.getElementById('clearButton').style.display = 'block';
        } catch (error) {
            alert('Invalid JSON content.');
        }
    } else {
        alert('Please upload a JSON file or paste JSON content.');
    }
});

document.getElementById('clearButton').addEventListener('click', () => {
    document.getElementById('jsonTable').innerHTML = '';
    document.getElementById('clearButton').style.display = 'none';
    document.getElementById('jsonInput').value = '';  // Clear text area when clearing content
    document.getElementById('fileInput').value = '';  // Clear file input when clearing content
    document.getElementById('fileName').textContent = 'No file chosen';  // Reset file name display
});

function displayJsonAsTable(jsonData) {
    const tableContainer = document.getElementById('jsonTable');
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const keys = getAllKeys(jsonData);
    const headerRow = document.createElement('tr');

    keys.forEach(key => {
        const th = document.createElement('th');
        th.innerText = key;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const row = document.createElement('tr');
    keys.forEach(key => {
        const td = document.createElement('td');
        td.innerHTML = syntaxHighlight(getNestedValue(jsonData, key));
        row.appendChild(td);
    });

    tbody.appendChild(row);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

function getAllKeys(obj, prefix = '') {
    const keys = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                keys.push(...getAllKeys(obj[key], newKey));
            } else {
                keys.push(newKey);
            }
        }
    }
    return keys;
}

function getNestedValue(obj, key) {
    const keys = key.split('.');
    let value = obj;
    keys.forEach(k => {
        value = value[k];
    });
    return typeof value === 'object' ? JSON.stringify(value) : value;
}

// JSON syntax highlighting
function syntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'json-value-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
            } else {
                cls = 'json-value-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-value-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-value-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}
