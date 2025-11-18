<h1>Nestify — Self-Hosted Cloud Storage & File-Sharing Platform</h1>
<a href="https://nestify-w18c.onrender.com">Nestify Website Live Link</a>

<p>
  <strong>Nestify</strong> is a full-stack cloud drive designed for secure file storage, seamless collaboration, and fast sharing. 
  Built with <strong>Node.js, Express, React (Vite), Supabase, and Tailwind CSS</strong>, it provides a smooth, modern alternative
  to Google Drive — but fully <strong>self-hosted</strong>.
</p>

<hr/>

<h2>Features</h2>

<h3>🔐 Authentication & Security</h3>
<ul>
  <li>Google OAuth + JWT-based session authentication</li>
  <li>Role-based access control (Owner, Edit, View)</li>
  <li>Protected routes & secure API permissions</li>
</ul>

<h3>📁 File Storage & Management</h3>
<ul>
  <li>Drag-and-drop file uploads</li>
  <li>Inline preview for images, PDFs, and documents</li>
  <li>Create, rename, delete folders</li>
  <li>Move files between folders</li>
  <li>Real-time file search</li>
  <li>Storage usage tracking</li>
</ul>

<h3>🔗 Sharing & Collaboration</h3>
<ul>
  <li>Share individual files via public links</li>
  <li>Share entire drive with read-only permissions</li>
  <li>Auto-generated secure share tokens</li>
  <li>Inline previews + downloadable access</li>
</ul>

<h3>⚙️ Backend Architecture</h3>
<ul>
  <li>Node.js + Express REST APIs</li>
  <li>Supabase for database & object storage</li>
  <li>Modular controllers, middlewares, and permissions</li>
</ul>

<h3>🎨 Frontend UI</h3>
<ul>
  <li>React (Vite) + Tailwind CSS</li>
  <li>Modern dashboard UI with gradients & animations</li>
  <li>Quick action panel for uploads & sharing</li>
  <li>Smooth UX with async loaders</li>
</ul>

<hr/>

<h2>🛠️ Tech Stack</h2>

<h3>Frontend</h3>
<ul>
  <li>React (Vite)</li>
  <li>Tailwind CSS</li>
  <li>Axios</li>
</ul>

<h3>Backend</h3>
<ul>
  <li>Node.js</li>
  <li>Express.js</li>
  <li>JWT Authentication</li>
  <li>Multer (File Uploads)</li>
</ul>

<h3>Database & Storage</h3>
<ul>
  <li>Supabase (PostgreSQL)</li>
  <li>Supabase Buckets for file storage</li>
</ul>

<hr/>

<h2>Some Snapshots of the website</h2>
<h3>Landing Page</h3>
<img width="1896" height="872" alt="ss1" src="https://github.com/user-attachments/assets/37dfeb77-6a40-42ac-9560-230b3777a3d1" />

<h3>Dashboard</h3>
<img width="1897" height="906" alt="ss2" src="https://github.com/user-attachments/assets/4e1ca254-c0dc-4704-b125-59695967ba6f" />

<h3>Folder Page</h3>
<img width="1896" height="897" alt="ss3" src="https://github.com/user-attachments/assets/6a43da38-50cb-4706-9154-bb1b8b4c7f10" />

<h3>Shared Drive</h3>
<img width="1832" height="901" alt="ss4" src="https://github.com/user-attachments/assets/35864b02-796b-4e6c-8ae6-3531aa22397c" />


<h2>📦 How to Run Locally</h2>

<h3>1. Clone the Repo</h3>
<pre>
git clone https://github.com/YOUR-USERNAME/nestify.git
cd nestify
</pre>

<h3>2. Install Backend Dependencies</h3>
<pre>
cd backend
npm install
</pre>

<h3>3. Configure Backend Environment</h3>
<pre>
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
</pre>

<h3>4. Start Backend</h3>
<pre>npm run dev</pre>

<h3>5. Install Frontend Dependencies</h3>
<pre>
cd ../frontend
npm install
</pre>

<h3>6. Configure Frontend Environment</h3>
<pre>
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_anon_key
</pre>

<h3>7. Start Frontend</h3>
<pre>npm run dev</pre>

<hr/>

<h2>🧩 Folder Structure</h2>
<pre>
nestify/
│── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── config/
│   ├── server.js
│
│── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.jsx
│   └── vite.config.js
│
└── README.md
</pre>

<hr/>

<h2>Future Enhancements</h2>
<ul>
  <li>File version history</li>
  <li>Recycle bin + restore</li>
  <li>Real-time collaboration</li>
  <li>Upload progress bars</li>
  <li>Offline sync</li>
</ul>

<hr/>

<h2>👤 Author</h2>
<p>
  <strong>Shreyas J U</strong>
  📧 <a href="mailto:sshreyasju@gmail.com">sshreyasju@gmail.com</a><br/>
  🔗 <a href="https://github.com/Shreyas-J-U">GitHub Profile</a>
</p>

<hr/>

<h2>📜 License</h2>
<p>MIT License — free to use & modify.</p>
