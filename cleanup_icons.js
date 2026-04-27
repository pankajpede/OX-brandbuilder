const fs = require('fs');
const path = require('path');

const rootDir = 'd:/Projects/Onella/Design System/OX-Brand-Builder/public/icons';

const requiredIcons = {
  'feather': [
    'user.svg', 'bell.svg', 'mail.svg', 'trash-2.svg', 'bookmark.svg', 
    'calendar.svg', 'message-circle.svg', 'file.svg', 'image.svg', 
    'copy.svg', 'save.svg', 'logo.svg'
  ],
  'Tabler-icons': {
    'styles': ['outline', 'filled'],
    'icons': [
      'user.svg', 'bell.svg', 'mail.svg', 'trash.svg', 'bookmark.svg', 
      'calendar.svg', 'message.svg', 'file.svg', 'photo.svg', 'copy.svg', 
      'id.svg', 'device-floppy.svg'
    ],
    'root': ['logo.svg']
  },
  'Lucid-icons': [
    'user.svg', 'bell.svg', 'mail.svg', 'trash.svg', 'bookmark.svg', 
    'calendar.svg', 'message-circle.svg', 'file.svg', 'image.svg', 
    'copy.svg', 'id-card.svg', 'save.svg', 'feather.svg'
  ],
  'font-awesome': {
    'versions': ['5.0', '6.0', '7.0'],
    'styles': ['solid', 'regular', 'brands'],
    'icons': [
      'user.svg', 'bell.svg', 'envelope.svg', 'trash.svg', 'bookmark.svg', 
      'calendar.svg', 'comment.svg', 'file.svg', 'image.svg', 
      'address-card.svg', 'copy.svg', 'save.svg', 'floppy-disk.svg', 
      'trash-can.svg', 'trash-alt.svg'
    ],
    'brands': [
      'facebook.svg', 'twitter.svg', 'instagram.svg', 'github.svg', 
      'linkedin.svg', 'youtube.svg', 'whatsapp.svg', 'google.svg'
    ],
    'root': ['logo.svg']
  }
};

function deleteUnwanted(dir, keepList) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) return;
    if (!keepList.includes(file)) {
      console.log(`Deleting ${filePath}`);
      fs.unlinkSync(filePath);
    }
  });
}

// 1. Feather
deleteUnwanted(path.join(rootDir, 'feather'), requiredIcons.feather);

// 2. Tabler Icons
const tablerDir = path.join(rootDir, 'Tabler-icons');
deleteUnwanted(tablerDir, requiredIcons['Tabler-icons'].root);
requiredIcons['Tabler-icons'].styles.forEach(style => {
  deleteUnwanted(path.join(tablerDir, style), requiredIcons['Tabler-icons'].icons);
});

// 3. Lucid Icons (Lucide)
// Note: Lucid-icons folder also contains .json files, we'll delete them too if not needed, 
// but the script above only deletes files not in keepList.
deleteUnwanted(path.join(rootDir, 'Lucid-icons'), requiredIcons['Lucid-icons']);

// 4. Font Awesome
const faDir = path.join(rootDir, 'font-awesome');
deleteUnwanted(faDir, requiredIcons['font-awesome'].root);
requiredIcons['font-awesome'].versions.forEach(version => {
  const verDir = path.join(faDir, version);
  requiredIcons['font-awesome'].styles.forEach(style => {
    const styleDir = path.join(verDir, style);
    const keep = style === 'brands' ? requiredIcons['font-awesome'].brands : requiredIcons['font-awesome'].icons;
    deleteUnwanted(styleDir, keep);
  });
});

console.log('Cleanup complete.');
