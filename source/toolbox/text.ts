
// adapted by chase moskal

// Taken from https://github.com/feross/buffer/blob/master/index.js
// Thanks Feross et al! :-)

export function toData(str: string): Uint8Array {
	return (typeof Uint8Array === "undefined")
		? <any>utf8ToBytes(str)
		: new Uint8Array(utf8ToBytes(str))
}

export function fromData(bytes: Uint8Array): string {
	return utf8Slice(bytes, 0, bytes.length)
}

function utf8ToBytes(string: string, units?: number): number[] {
	units = units || Infinity
	let codePoint: any
	const length = string.length
	let leadSurrogate = null
	const bytes = []
	let i = 0

	for (; i < length; i++) {
		codePoint = string.charCodeAt(i)

		// is surrogate component
		if (codePoint > 0xD7FF && codePoint < 0xE000) {
			// last char was a lead
			if (leadSurrogate) {
				// 2 leads in a row
				if (codePoint < 0xDC00) {
					if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
					leadSurrogate = codePoint
					continue
				} else {
					// valid surrogate pair
					codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
					leadSurrogate = null
				}
			} else {
				// no lead yet

				if (codePoint > 0xDBFF) {
					// unexpected trail
					if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
					continue
				} else if (i + 1 === length) {
					// unpaired lead
					if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
					continue
				} else {
					// valid lead
					leadSurrogate = codePoint
					continue
				}
			}
		} else if (leadSurrogate) {
			// valid bmp char, but last char was a lead
			if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
			leadSurrogate = null
		}

		// encode utf8
		if (codePoint < 0x80) {
			if ((units -= 1) < 0) break
			bytes.push(codePoint)
		} else if (codePoint < 0x800) {
			if ((units -= 2) < 0) break
			bytes.push(
				codePoint >> 0x6 | 0xC0,
				codePoint & 0x3F | 0x80
			)
		} else if (codePoint < 0x10000) {
			if ((units -= 3) < 0) break
			bytes.push(
				codePoint >> 0xC | 0xE0,
				codePoint >> 0x6 & 0x3F | 0x80,
				codePoint & 0x3F | 0x80
			)
		} else if (codePoint < 0x200000) {
			if ((units -= 4) < 0) break
			bytes.push(
				codePoint >> 0x12 | 0xF0,
				codePoint >> 0xC & 0x3F | 0x80,
				codePoint >> 0x6 & 0x3F | 0x80,
				codePoint & 0x3F | 0x80
			)
		} else {
			throw new Error("Invalid code point")
		}
	}

	return bytes
}

function utf8Slice(buf: Uint8Array | number[], start: number, end: number) {
	let res = ""
	let tmp = ""
	end = Math.min(buf.length, end || Infinity)
	start = start || 0

	for (let i = start; i < end; i++) {
		if (buf[i] <= 0x7F) {
			res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
			tmp = ""
		} else {
			tmp += "%" + buf[i].toString(16)
		}
	}

	return res + decodeUtf8Char(tmp)
}

function decodeUtf8Char (str: string) {
	try {
		return decodeURIComponent(str)
	} catch (err) {
		return String.fromCharCode(0xFFFD) // UTF 8 invalid char
	}
}
