import Setting from '../models/setting.model.js';

export const getSettings = async (req, res) => {
  try {
    const dbSettings = await Setting.findMany();
    const settings = {};
    
    // Convert array of key-values to an object
    dbSettings.forEach(s => {
      settings[s.key] = s.value;
    });

    // Provide default settings if empty (Neutral "CMS" branding)
    const defaults = {
      site_title: 'CMS',
      site_tagline: 'A modern lightweight content management platform',
      primary_color: '#3b82f6',
      accent_color: '#1d4ed8',
      navigation_menu: JSON.stringify([
        { label: 'Home', link: '/' },
        { label: 'Sample Page', link: '/sample-page' }
      ])
    };

    const finalSettings = { ...defaults, ...settings };
    res.json(finalSettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve settings.' });
  }
};

export const updateSettings = async (req, res) => {
  const settingsData = req.body;

  try {
    const promises = Object.keys(settingsData).map(key => {
      const val = typeof settingsData[key] === 'object' ? JSON.stringify(settingsData[key]) : String(settingsData[key]);
      return Setting.upsert({
        where: { key },
        update: { value: val },
        create: { key, value: val }
      });
    });

    await Promise.all(promises);
    res.json({ message: 'Settings updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
};
