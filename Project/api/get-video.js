const axios = require('axios');

module.exports = async function handler(req, res) {
  const { bookId, episode = 1 } = req.query;

  if (!bookId) {
    return res.status(400).json({ success: false, error: "bookId wajib diisi!" });
  }

  try {
    // 1. Meminta Kunci Token dari Joki
    const tokenRes = await axios.get("https://dramabox-token.vercel.app/token");
    const { token, deviceid } = tokenRes.data;

    // 2. Menyamar Menjadi HP Android (Spoofing)
    const url = "https://sapi.dramaboxdb.com/drama-box/chapterv2/batch/load";
    const headers = {
      "User-Agent": "okhttp/4.10.0",
      "Accept-Encoding": "gzip",
      "Content-Type": "application/json",
      "tn": `Bearer ${token}`,
      "version": "430",
      "vn": "4.3.0",
      "cid": "DRA1000000",
      "package-name": "com.storymatrix.drama",
      "apn": "1",
      "device-id": deviceid,
      "language": "in",
      "current-language": "in",
      "p": "43",
      "time-zone": "+0800"
    };

    const data = {
      boundaryIndex: 0,
      comingPlaySectionId: -1,
      index: parseInt(episode),
      currencyPlaySource: "discover_new_rec_new",
      needEndRecommend: 0,
      currencyPlaySourceName: "",
      preLoad: false,
      rid: "",
      pullCid: "",
      loadDirection: 0,
      startUpKey: "",
      bookId: bookId
    };

    // 3. Tembak Server DramaBox
    const dbRes = await axios.post(url, data, { headers });

    // 4. Tangkap Link Video Aslinya
    if (dbRes.data && dbRes.data.data && dbRes.data.data.chapterList) {
        const videoUrl = dbRes.data.data.chapterList[0].cdnList[0];
        return res.status(200).json({ success: true, videoUrl });
    } else {
        return res.status(500).json({ success: false, error: "Video tidak ditemukan." });
    }
    
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server Video Sedang Sibuk." });
  }
};
