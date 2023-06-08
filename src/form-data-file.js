String.prototype.utf8CodeAt = function () {
    let bytes = [];
    for (let i = 0; i < this.length; i++) {
        let code = this.charCodeAt(i);
        if (0x00 <= code && code <= 0x7f) {
            bytes.push(code);
        } else if (0x80 <= code && code <= 0x7ff) {
            bytes.push((192 | (31 & (code >> 6))));
            bytes.push((128 | (63 & code)));
        } else if ((0x800 <= code && code <= 0xd7ff) || (0xe000 <= code && code <= 0xffff)) {
            bytes.push((224 | (15 & (code >> 12))));
            bytes.push((128 | (63 & (code >> 6))));
            bytes.push((128 | (63 & code)));
        }
    }
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] &= 0xff;
    }
    return bytes;
};

Array.prototype.convert2ArrayBuffer = function () {
    const len = this.reduce((prev, cur) => {
        return prev + cur.length;
    }, 0);
    const arrayBuffer = new ArrayBuffer(len);
    const buffer = new Uint8Array(arrayBuffer);
    let sum = 0;
    for (let i = 0; i < this.length; i++) {
        for (let j = 0; j < this[i].length; j++) {
            buffer[sum + j] = this[i][j];
        }
        sum += this[i].length;
    }
    return arrayBuffer;
}

function FormData() {
    this.dataset = {};
    this.generateBoundary = function () {
        let boundary = '----WebKitFormBoundary';
        const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        const len = chars.length;
        for (let i = 0; i < 16; i++) {
            boundary += chars.charAt(~~(Math.random() * len));
        }
        return boundary;
    }
    this.br = '\r\n';
    this.boundary = this.generateBoundary();
    this.contentType = ['multipart/form-data; boundary=', this.boundary].join('');
    this.splitBoundary = ['--', this.boundary].join('');
    this.endBoundary = [this.splitBoundary, '--'].join('');
};

FormData.prototype.append = function (name, value) {
    if (value instanceof File) {
        if (value.hasOwnProperty('name') == false || !value.name) {
            return this;
        }
        if (value.hasOwnProperty('type') == false || !value.type) {
            return this;
        }
        if (value.hasOwnProperty('buffer') == false || !value.buffer) {
            return this;
        }
    }
    this.dataset[name] = value;
    return this;
};
FormData.prototype.has = function (name) {
    return this.dataset.hasOwnProperty(name);
};
FormData.prototype.get = function (name) {
    return this.dataset[name];
};
FormData.prototype.getData = function () {
    let data = [];
    for (const key in this.dataset) {
        if (this.dataset[key] instanceof File) {
            data.push([
                this.splitBoundary, this.br,
                `Content-Disposition: form-data; name="${key}"; filename="${this.dataset[key].name}"`, this.br,
                `Content-Type: ${this.dataset[key].type}`,
                this.br,
                this.br,
            ].join('').utf8CodeAt());
            data.push(new Uint8Array(this.dataset[key].arrayBuffer()));
            data.push(this.br.utf8CodeAt());
        } else {
            data.push([
                this.splitBoundary, this.br,
                `Content-Disposition: form-data; name="${key}"`,
                this.br,
                this.br,
                this.dataset[key],
                this.br,
            ].join('').utf8CodeAt());
        }
    }
    data.push(this.endBoundary.utf8CodeAt());
    return data.convert2ArrayBuffer();
};
FormData.prototype.getContentType = function () {
    return this.contentType;
};

function File(arrayBuffer, filename, mime) {
    this.name = filename;
    this.type = mime;
    this.buffer = arrayBuffer;
};

File.prototype.arrayBuffer = function () {
    return this.buffer;
};

function temp2File(tempFilePath, callback, mime) {
    const filename = tempFilePath.replace(/^(.*)\/(.*)/, "$2")
    return new File(callback(tempFilePath), filename, mime);
};