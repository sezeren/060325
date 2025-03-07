import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Meeting } from '../types/meeting';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} dakika`;
}

export async function exportMeetingToPDF(meeting: Meeting) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${meeting.title}</title>
        <style>
          body {
            font-family: 'Helvetica', sans-serif;
            margin: 40px;
            color: #333;
          }
          h1 {
            color: #007AFF;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .info {
            margin-bottom: 30px;
            color: #666;
          }
          .tags {
            margin-bottom: 20px;
          }
          .tag {
            background-color: #F2F2F7;
            padding: 4px 12px;
            border-radius: 12px;
            display: inline-block;
            margin-right: 8px;
            margin-bottom: 8px;
            color: #007AFF;
          }
          .section {
            margin-bottom: 30px;
          }
          h2 {
            color: #000;
            font-size: 20px;
            margin-bottom: 15px;
          }
          .note {
            background-color: #F9F9F9;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 10px;
          }
          hr {
            border: none;
            border-top: 1px solid #E5E5EA;
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <h1>${meeting.title}</h1>
        
        <div class="info">
          <p>Tarih: ${formatDate(meeting.date)}</p>
          <p>Süre: ${formatDuration(meeting.duration)}</p>
        </div>

        ${meeting.tags && meeting.tags.length > 0 ? `
          <div class="tags">
            ${meeting.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}

        <div class="section">
          <h2>Özet</h2>
          <p>${meeting.summary}</p>
        </div>

        <hr>

        <div class="section">
          <h2>Transkript</h2>
          <p>${meeting.transcript}</p>
        </div>

        ${meeting.notes && meeting.notes.length > 0 ? `
          <hr>
          <div class="section">
            <h2>Notlar</h2>
            ${meeting.notes.map(note => `
              <div class="note">
                <p>${note}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false
    });

    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = uri;
      link.download = `${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      link.click();
    } else {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Toplantı Raporu',
        UTI: 'com.adobe.pdf'
      });
    }
  } catch (error) {
    console.error('PDF dışa aktarma hatası:', error);
    throw error;
  }
}