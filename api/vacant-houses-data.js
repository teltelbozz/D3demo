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

    // クエリを実行して集計データを取得
    const query = `
      SELECT 
        地域 AS locationName,
        SUM(空き家数) AS emptyhouse
      FROM vacant_houses
      WHERE 
        腐朽破損有無 IN('総数') AND
        住宅建て方 IN('一戸建') AND 
        建物構造 IN('木造')
      GROUP BY 地域
      ORDER BY emptyhouse ASC;
    `;
/*
    const query = `
    SELECT 
      地域 AS locationName,
      SUM(空き家数) AS emptyhouse
    FROM vacant_houses
    WHERE 
      腐朽破損有無 IN($3) AND
      住宅建て方 IN($1) AND 
      建物構造 IN($2)
    GROUP BY 地域
    ORDER BY emptyhouse ASC;
  `;1
*/

console.log(query)
    const values = [houseType, buildingType, decayStatus];
    
    console.error(values)
    console.log(values)
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
