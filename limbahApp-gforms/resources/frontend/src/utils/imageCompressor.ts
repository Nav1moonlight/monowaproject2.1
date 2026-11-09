export interface CompressOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    mimeType?: 'image/webp' | 'image/jpeg';
}

export interface CompressionResult {
    file: File;
    originalSize: number;
    compressedSize: number;
    originalSizeFormatted: string;
    compressedSizeFormatted: string;
    savedPercentage: number;
    previewUrl: string;
    width: number;
    height: number;
    mimeType: string;
}

export function formatBytes(bytes: number, decimals: number = 1): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Kompresi gambar di sisi klien (Browser/HP) sebelum diunggah ke server.
 * Mereduksi ukuran file hingga 80-95% dengan tetap menjaga ketajaman teks/angka timbangan.
 * Dilengkapi fallback format, proteksi transparansi, dan efisiensi memori (Object URL).
 */
export async function compressImage(
    file: File,
    options: CompressOptions = {},
): Promise<CompressionResult> {
    const {
        maxWidth = 1600,
        maxHeight = 1600,
        quality = 0.75,
        mimeType = 'image/webp',
    } = options;

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
        throw new Error('File yang dipilih bukan merupakan file gambar yang valid.');
    }

    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            // Segera bersihkan Object URL file asli dari memori browser
            URL.revokeObjectURL(objectUrl);

            let { width, height } = img;

            // Hitung dimensi proporsional agar tidak melebihi batas maksimum
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.max(1, Math.round(width * ratio));
                height = Math.max(1, Math.round(height * ratio));
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Gagal menginisialisasi canvas untuk kompresi gambar.'));
                return;
            }

            // Jika fallback ke JPEG, beri latar belakang putih agar transparansi PNG tidak menjadi hitam
            if (mimeType === 'image/jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
            }

            // Render gambar dengan smoothing berkualitas tinggi
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Fungsi untuk membuat blob dengan fallback jika WebP tidak didukung
            const tryToBlob = (targetMime: string, targetQuality: number) => {
                canvas.toBlob(
                    (blob) => {
                        // Jika WebP gagal (browser lama), fallback otomatis ke JPEG
                        if (!blob && targetMime === 'image/webp') {
                            tryToBlob('image/jpeg', targetQuality);
                            return;
                        }

                        if (!blob) {
                            reject(new Error('Gagal menghasilkan file gambar terkompresi.'));
                            return;
                        }

                        const actualMime = blob.type || targetMime;
                        const extension = actualMime === 'image/webp' ? 'webp' : 'jpg';
                        const baseName = file.name.replace(/\.[^/.]+$/, '');
                        const newFileName = `${baseName}.${extension}`;

                        const originalSize = file.size;
                        const compressedSize = blob.size;

                        // Proteksi: Jika gambar asli sudah sangat kecil (<300KB) dan hasil kompresi malah lebih besar,
                        // gunakan file asli agar tidak terjadi degradasi yang tidak perlu.
                        if (compressedSize >= originalSize && originalSize <= 300 * 1024) {
                            const previewUrl = URL.createObjectURL(file);
                            resolve({
                                file,
                                originalSize,
                                compressedSize: originalSize,
                                originalSizeFormatted: formatBytes(originalSize),
                                compressedSizeFormatted: formatBytes(originalSize),
                                savedPercentage: 0,
                                previewUrl,
                                width: img.width,
                                height: img.height,
                                mimeType: file.type,
                            });
                            return;
                        }

                        const compressedFile = new File([blob], newFileName, {
                            type: actualMime,
                            lastModified: Date.now(),
                        });

                        const savedRatio =
                            originalSize > 0
                                ? Math.max(0, ((originalSize - compressedSize) / originalSize) * 100)
                                : 0;

                        const previewUrl = URL.createObjectURL(blob);

                        resolve({
                            file: compressedFile,
                            originalSize,
                            compressedSize,
                            originalSizeFormatted: formatBytes(originalSize),
                            compressedSizeFormatted: formatBytes(compressedSize),
                            savedPercentage: Math.round(savedRatio),
                            previewUrl,
                            width,
                            height,
                            mimeType: actualMime,
                        });
                    },
                    targetMime,
                    targetQuality,
                );
            };

            tryToBlob(mimeType, quality);
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Format gambar tidak dapat dibaca atau rusak.'));
        };

        img.src = objectUrl;
    });
}
