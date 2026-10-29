# VisualScout

A shopkeeper photographs a shelf. YOLOv8 counts bottles, cups, books, and fruit. If a counted item is under its minimum, the dashboard shows a low-stock alert.

## Run the API

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

MySQL database name is `visualscout`. The connection string is in `backend/.env`.

## Run the app

```bash
cd app
npm install
npm run web
```

Open [http://localhost:8081](http://localhost:8081).

Demo login: `samavia.demo@example.com` / `secret12`.

On a phone, `npm start`, then scan the QR with Expo Go. Phone and PC must be on the same Wi-Fi.

## How a scan works

The pretrained YOLOv8n model recognizes general objects (COCO), not shop brands. Tracked items are Bottles, Cups, Books, Apples, Bananas, and Oranges. The saved photo is drawn with a box and a confidence label on each object. An alert appears only when that object is visible and the count is below the minimum.

The first scan downloads `yolov8n.pt` and can take a minute.

## API

- `POST /auth/register` and `POST /auth/login`
- `GET /auth/me`
- `GET /dashboard` — latest counts and low-stock alerts
- `GET /products` — tracked shelf items
- `POST /scans` — upload one shelf photo
- `GET /scans` and `GET /scans/{id}`
