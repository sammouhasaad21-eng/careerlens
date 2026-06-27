// pdf-upload.js
// يضيف زر رفع PDF لكل textarea في الموقع

(function () {

  // CSS للزر
  const style = document.createElement('style');
  style.textContent = `
    .pdf-upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: 1px dashed var(--border-2);
      color: var(--teal);
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 500;
      padding: 6px 14px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 6px;
    }
    .pdf-upload-btn:hover {
      background: var(--teal-bg);
      border-color: rgba(0,212,180,0.4);
    }
    .pdf-upload-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .pdf-upload-input { display: none; }
    .pdf-status {
      font-size: 12px;
      margin-top: 4px;
      min-height: 18px;
    }
    .pdf-status.loading { color: var(--teal); }
    .pdf-status.success { color: #22C55E; }
    .pdf-status.error   { color: var(--coral); }
  `;
  document.head.appendChild(style);

  // دالة رفع PDF
  async function handlePDF(file, textarea, btn, status) {
    if (!file || file.type !== 'application/pdf') {
      status.textContent = '❌ Please select a PDF file';
      status.className = 'pdf-status error';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      status.textContent = '❌ File too large. Max 5MB.';
      status.className = 'pdf-status error';
      return;
    }

    btn.disabled = true;
    status.textContent = '⏳ Reading PDF...';
    status.className = 'pdf-status loading';

    try {
      // تحويل PDF إلى base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // إرسال إلى الـ Function
      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64 }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Extraction failed');
      }

      // وضع النص في الـ textarea
      textarea.value = data.text;
      textarea.dispatchEvent(new Event('input'));

      status.textContent = `✅ PDF extracted — ${data.text.length} characters`;
      status.className = 'pdf-status success';

    } catch (err) {
      status.textContent = '❌ ' + (err.message || 'Failed. Please paste text manually.');
      status.className = 'pdf-status error';
    } finally {
      btn.disabled = false;
    }
  }

  // إضافة زر لكل textarea
  function addUploadButton(textarea, labelKey) {
    const wrapper = textarea.parentElement;

    // إنشاء input مخفي
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.className = 'pdf-upload-input';

    // إنشاء الزر
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pdf-upload-btn';
    btn.innerHTML = '📄 Upload PDF';
    btn.setAttribute('data-i18n-pdf', labelKey);

    // حالة الرفع
    const status = document.createElement('div');
    status.className = 'pdf-status';

    // ربط الأحداث
    btn.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        handlePDF(e.target.files[0], textarea, btn, status);
      }
    });

    // دعم السحب والإفلات
    textarea.addEventListener('dragover', (e) => {
      e.preventDefault();
      textarea.style.borderColor = 'rgba(0,212,180,0.6)';
    });
    textarea.addEventListener('dragleave', () => {
      textarea.style.borderColor = '';
    });
    textarea.addEventListener('drop', (e) => {
      e.preventDefault();
      textarea.style.borderColor = '';
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/pdf') {
        handlePDF(file, textarea, btn, status);
      }
    });

    wrapper.appendChild(input);
    wrapper.appendChild(btn);
    wrapper.appendChild(status);
  }

  // تشغيل بعد تحميل الصفحة
  document.addEventListener('DOMContentLoaded', () => {
    const cvTextarea = document.getElementById('cv-input');
    const jdTextarea = document.getElementById('jd-input');

    if (cvTextarea) addUploadButton(cvTextarea, 'upload_cv');
    if (jdTextarea) addUploadButton(jdTextarea, 'upload_jd');
  });

})();
