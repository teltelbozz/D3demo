import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req, res) {
        // CORSヘッダーを設定
        res.setHeader('Access-Control-Allow-Origin', '*'); // 任意のオリジンを許可
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  try {
    const { houseType, buildingType, decayStatus } = req.query;

    // 必須パラメータのチェック
    if (!houseType || !buildingType || !decayStatus) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

           // "すべて" の処理
        const houseTypes = houseType === "（すべて）"
            ? "'一戸建','長屋建','共同住宅','その他'" // すべてのオプション
            : `$1`; // プレースホルダを使用

        const buildingTypes = buildingType === "（すべて）"
            ? "'木造','鉄骨造','鉄筋コンクリート造'" // 仮の例: 建物構造のすべてのオプション
            : `$2`;

        const decayStatuses = decayStatus === "(すべて)"
            ? "'腐朽あり','腐朽なし'" // 仮の例: 腐朽破損のすべてのオプション
            : `$3`;


    // クエリを実行して集計データを取得
    const query = `
      SELECT 
        地域 AS locationName,
        SUM(空き家数) AS emptyhouse
      FROM vacant_houses
      WHERE 
        腐朽破損有無 IN(${decayStatuses}) AND
        住宅建て方 IN(${houseTypes}) AND 
        建物構造 IN(${buildingTypes})
      GROUP BY 地域
      ORDER BY emptyhouse ASC;
    `;

     console.log(query)

    const values = [houseType, buildingType, decayStatus];
    const result = await pool.query(query, values);

    // 必要な形式にデータを整形
    const formattedResult = result.rows.map(row => ({
      locationName: row.locationname,
      emptyhouse: parseInt(row.emptyhouse, 10),
    }));

    // JSONレスポンスを返す
    res.status(200).json(formattedResult);
  } catch (error) {
    console.error('データベースエラー:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
