import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function MedicalTestsPage() {
  const result = await pool.query(`
    SELECT 
      mt.name, 
      tc.name AS category, 
      u.name AS unit, 
      mt.normalmin, 
      mt.normalmax
    FROM medicaltests mt
    JOIN testcategories tc ON mt.idcategory = tc.id
    JOIN uom u ON mt.iduom = u.id;
  `);

  return (
    <div>
      <h1>Medical Tests</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Min</th>
            <th>Max</th>
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i}>
              <td>{row.name}</td>
              <td>{row.category}</td>
              <td>{row.unit}</td>
              <td>{row.normalmin}</td>
              <td>{row.normalmax}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}