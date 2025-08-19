import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  LogIn,
  LogOut,
  Send,
  CreditCard,
  ShieldCheck,
  Image as ImageIcon,
  Globe,
  MailOpen,
  Instagram,
} from "lucide-react";

/**
 * Минимальная «бэза» на localStorage
 */
const storage = {
  getUsers: () => JSON.parse(localStorage.getItem("po_users") || "[]"),
  setUsers: (u) => localStorage.setItem("po_users", JSON.stringify(u)),
  getSession: () => JSON.parse(localStorage.getItem("po_session") || "null"),
  setSession: (s) => localStorage.setItem("po_session", JSON.stringify(s)),
  clearSession: () => localStorage.removeItem("po_session"),
};

function useAuth() {
  const [user, setUser] = useState(storage.getSession());
  useEffect(() => {
    storage.setSession(user);
  }, [user]);
  const login = (login, password) => {
    const users = storage.getUsers();
    const found = users.find((u) => u.login === login && u.password === password);
    if (found) {
      setUser({ login: found.login, name: found.name });
      return true;
    }
    return false;
  };
  const logout = () => setUser(null);
  const register = (payload) => {
    const users = storage.getUsers();
    if (users.some((u) => u.login === payload.login)) {
      throw new Error("Логин уже занят");
    }
    users.push(payload);
    storage.setUsers(users);
    setUser({ login: payload.login, name: payload.name });
  };
  return { user, login, logout, register };
}

/** UI helpers */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 ${className}`}>{children}</div>
);
const Label = ({ children }) => <label className="text-sm text-slate-600 mb-1 block">{children}</label>;
const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400 ${
      props.className || ""
    }`}
  />
);
const Textarea = (props) => (
  <textarea
    {...props}
    className={`w-full min-h-[160px] rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400 ${
      props.className || ""
    }`}
  />
);
const Button = ({ children, disabled, className = "", ...rest }) => (
  <button
    {...rest}
    disabled={disabled}
    className={`rounded-2xl px-5 py-3 font-medium shadow ${
      disabled
        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
        : "bg-indigo-600 text-white hover:bg-indigo-700"
    } ${className}`}
  >
    {children}
  </button>
);

const Shell = ({ children, authed, onLogout }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
    {/* Header появляется только после авторизации. НЕ фиксированный ("едет" со страницей). */}
    {authed && (
      <header className="w-full bg-white/70 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-600" />
            <Link to="/compose" className="font-semibold text-slate-800">
              Письмо.Онлайн
            </Link>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              to="/profile"
              className="px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2"
            >
              <User className="w-4 h-4" /> Мой профиль
            </Link>
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Выйти
            </button>
          </nav>
        </div>
      </header>
    )}
    <main className="max-w-5xl mx-auto p-6">{children}</main>
    <footer className="text-center text-xs text-slate-400 pb-10">© {new Date().getFullYear()} Письмо.Онлайн</footer>
  </div>
);

/** Стр. 1 — Авторизация */
function LoginPage({ auth }) {
  const nav = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const canSubmit = login.trim() && password.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const ok = auth.login(login.trim(), password.trim());
    if (ok) {
      nav("/compose");
    } else {
      setError("Неверный логин или пароль");
    }
  };

  return (
    <Shell authed={false}>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Письмо.Онлайн</h1>
          <p className="text-slate-600 mb-6">Пишите тем, кто дорог. Быстро. Красиво. Оффлайн‑конверт — онлайн‑комфорт.</p>
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Логин</Label>
                <div className="relative">
                  <Input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Введите логин" />
                  <User className="w-4 h-4 absolute right-4 top-3.5 text-slate-400" />
                </div>
              </div>
              <div>
                <Label>Пароль</Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                  />
                  <Lock className="w-4 h-4 absolute right-4 top-3.5 text-slate-400" />
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-slate-400">Забыли пароль?</span>
                  <Link to="/register" className="text-indigo-600 hover:underline">
                    Регистрация
                  </Link>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <Button type="submit" disabled={!canSubmit} className="w-full flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" /> Войти
              </Button>

              <div className="text-center text-slate-400">или войдите при помощи</div>
              <div className="grid grid-cols-4 gap-2">
                <AuthIcon label="VK" icon={<Globe className="w-4 h-4" />} />
                <AuthIcon label="Gmail" icon={<MailOpen className="w-4 h-4" />} />
                <AuthIcon label="Google" icon={<ShieldCheck className="w-4 h-4" />} />
                <AuthIcon label="Inst" icon={<Instagram className="w-4 h-4" />} />
              </div>
            </form>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="hidden md:block">
          <Illustration />
        </motion.div>
      </div>
    </Shell>
  );
}

const AuthIcon = ({ icon, label }) => (
  <button className="w-full border border-slate-200 rounded-xl py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 justify-center">
    {icon}
    {label}
  </button>
);

const Illustration = () => (
  <div className="relative">
    <motion.div
      className="absolute -top-10 -left-6 w-24 h-24 rounded-3xl bg-indigo-200/50"
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 4 }}
    />
    <Card className="relative z-10">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-indigo-50"><Mail className="text-indigo-600" /></div>
        <div>
          <div className="font-semibold text-slate-800">Ваша почта — в одном месте</div>
          <div className="text-sm text-slate-500">Создайте письмо, мы распечатаем и отправим.</div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50 text-sm text-slate-600">📬 Конверты и открытки</div>
        <div className="p-3 rounded-2xl bg-slate-50 text-sm text-slate-600">🖨️ Красивое оформление</div>
        <div className="p-3 rounded-2xl bg-slate-50 text-sm text-slate-600">🚚 Доставка по миру</div>
        <div className="p-3 rounded-2xl bg-slate-50 text-sm text-slate-600">🔒 Безопасная оплата</div>
      </div>
    </Card>
  </div>
);

/** Регистрация */
function RegisterPage({ auth }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", login: "", password: "" });
  const [error, setError] = useState("");
  const complete = form.name.trim() && form.login.trim() && form.password.trim();
  const submit = (e) => {
    e.preventDefault();
    try {
      auth.register({ ...form });
      nav("/compose");
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <Shell authed={false}>
      <div className="max-w-lg mx-auto">
        <Card>
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" /> Регистрация
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Ваше имя</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Логин</Label>
              <Input value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} />
            </div>
            <div>
              <Label>Пароль</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button disabled={!complete} className="w-full">Создать аккаунт</Button>
            <div className="text-sm text-center text-slate-500">
              Уже есть аккаунт? <Link className="text-indigo-600" to="/">Войти</Link>
            </div>
          </form>
        </Card>
      </div>
    </Shell>
  );
}

/** Стр. 2 — Отправка письма */
function ComposePage({ auth }) {
  const nav = useNavigate();
  const [from, setFrom] = useState({ first: "", last: "", middle: "", address: "" });
  const [to, setTo] = useState({ first: "", last: "", middle: "", address: "" });
  const [body, setBody] = useState("");
  const [imageName, setImageName] = useState("");

  const allFilled = Object.values(from).every(Boolean) && Object.values(to).every(Boolean) && body.trim();

  const toPayment = (e) => {
    e.preventDefault();
    if (!allFilled) return;
    nav("/payment", { state: { from, to, body, imageName } });
  };

  return (
    <Shell authed={!!auth.user} onLogout={() => { auth.logout(); nav("/"); }}>
      {!auth.user ? (
        <Navigate to="/" replace />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Отправка письма</h2>
            <form onSubmit={toPayment} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-slate-700 mb-2">От кого</div>
                  <Label>Имя</Label>
                  <Input value={from.first} onChange={(e) => setFrom({ ...from, first: e.target.value })} />
                  <Label>Фамилия</Label>
                  <Input value={from.last} onChange={(e) => setFrom({ ...from, last: e.target.value })} />
                  <Label>Отчество</Label>
                  <Input value={from.middle} onChange={(e) => setFrom({ ...from, middle: e.target.value })} />
                  <Label>Адрес</Label>
                  <Input value={from.address} onChange={(e) => setFrom({ ...from, address: e.target.value })} />
                </div>
                <div>
                  <div className="font-medium text-slate-700 mb-2">Кому</div>
                  <Label>Имя</Label>
                  <Input value={to.first} onChange={(e) => setTo({ ...to, first: e.target.value })} />
                  <Label>Фамилия</Label>
                  <Input value={to.last} onChange={(e) => setTo({ ...to, last: e.target.value })} />
                  <Label>Отчество</Label>
                  <Input value={to.middle} onChange={(e) => setTo({ ...to, middle: e.target.value })} />
                  <Label>Адрес</Label>
                  <Input value={to.address} onChange={(e) => setTo({ ...to, address: e.target.value })} />
                </div>
              </div>

              <div>
                <Label>Текст письма</Label>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Введите основной текст письма" />
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="file" className="hidden" onChange={(e) => setImageName(e.target.files?.[0]?.name || "")}/>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50">
                      <ImageIcon className="w-4 h-4"/> Добавить изображение
                    </span>
                  </label>
                  <div className="text-xs text-slate-400">{imageName ? `Прикреплено: ${imageName}` : ""}</div>
                </div>
              </div>

              <Button disabled={!allFilled} className="w-full flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Отправить
              </Button>
              <div className="text-xs text-slate-400">Кнопка активируется только после заполнения всех полей.</div>
            </form>
          </Card>

          <CostPreview />
        </div>
      )}
    </Shell>
  );
}

const CostPreview = () => (
  <Card>
    <h3 className="text-lg font-semibold text-slate-800 mb-4">Стоимость отправки</h3>
    <ul className="space-y-3 text-slate-700">
      <li className="flex items-center justify-between"><span>Конверт: Конверт стандарт</span> <span>0,65 руб.</span></li>
      <li className="flex items-center justify-between"><span>Отправка письма</span> <span>3 руб.</span></li>
      <li className="flex items-center justify-between"><span>Открытка</span> <span>0 руб.</span></li>
    </ul>
    <div className="mt-4 border-t pt-3 flex items-center justify-between font-semibold">
      <span>Итого</span>
      <span>3,65 руб.</span>
    </div>
  </Card>
);

/** Стр. 3 — Оплата */
function PaymentPage() {
  const nav = useNavigate();
  const location = useLocation();

  // данные письма приходят из ComposePage через nav("/payment", { state: { ... } })
  const { from, to, body, imageName } = location.state || {};
  const [all, setAll] = React.useState(true);

  // функция оплаты и отправки письма на сервер
  const pay = async (e) => {
    e.preventDefault();
    if (!all) return;

    try {
      const response = await fetch("http://localhost:4000/api/mails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderFirst: from.first,
          senderLast: from.last,
          senderMiddle: from.middle || "",
          senderAddress: from.address,
          recipientFirst: to.first,
          recipientLast: to.last,
          recipientMiddle: to.middle || "",
          recipientAddress: to.address,
          body,
        }),
      });

      if (!response.ok) throw new Error("Ошибка сохранения письма");

      alert("✅ Оплата прошла");
      nav("/compose");
    } catch (err) {
      alert("❌ Ошибка: " + err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-6">💳 Оплата письма</h2>

        {/* форма оплаты */}
        <form onSubmit={pay} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Номер карты</label>
            <input
              type="text"
              className="w-full border p-2 rounded-md"
              placeholder="0000 0000 0000 0000"
              required
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">MM/YY</label>
              <input
                type="text"
                className="w-full border p-2 rounded-md"
                placeholder="12/34"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">CVV</label>
              <input
                type="text"
                className="w-full border p-2 rounded-md"
                placeholder="123"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Имя владельца карты
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded-md"
              placeholder="IVAN IVANOV"
              required
            />
          </div>

          {/* итог */}
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <p>Стоимость отправки: 3.65 руб.</p>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 transition"
          >
            Оплатить
          </button>
        </form>
      </div>
    </div>
  );
}


/** Профиль — просто заглушка */
function ProfilePage({ auth }) {
  return (
    <Shell authed={!!auth.user}>
      {!auth.user ? (
        <Navigate to="/" replace />
      ) : (
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <User className="text-indigo-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">{auth.user.name || auth.user.login}</div>
              <div className="text-slate-500 text-sm">Личный профиль</div>
            </div>
          </div>
        </Card>
      )}
    </Shell>
  );
}

/** Корневой компонент */
export default function App() {
  const auth = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage auth={auth} />} />
        <Route path="/register" element={<RegisterPage auth={auth} />} />
        <Route path="/compose" element={<ComposePage auth={auth} />} />
        <Route path="/payment" element={<PaymentPage auth={auth} />} />
        <Route path="/profile" element={<ProfilePage auth={auth} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
