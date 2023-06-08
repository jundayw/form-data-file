let fb = new FormData();
fb.append('data', 123);
fb.append('file', new File('fileBuffer', '1.png', 'image/png'));
fb.append('img', temp2File('1.png', function (i) {
    return i;
}, 'image/png'));

console.log(fb)
console.log(fb.getData())
console.log(fb.getContentType())

// Create the request options
const requestOptions = {
    method: 'POST',
    headers: {
        'Content-Type': fb.getContentType()
    },
    body: fb.getData()
};

// Send the request
fetch('http://127.0.0.1', requestOptions)
    .then(response => {
        // Handle the response
        if (response.ok) {
            // Request was successful
            return response.json();
        } else {
            // Request failed
            throw new Error('Request failed with status ' + response.status);
        }
    })
    .then(data => {
        // Handle the response data
        console.log(data);
    })
    .catch(error => {
        // Handle any errors
        console.error(error);
    });