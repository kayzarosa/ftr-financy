import { Route, Routes } from "react-router-dom";

export function App() {
	return (
		<Routes>
			<Route path="/" element={<div>Home (login/dashboard)</div>} />
			<Route path="/transacoes" element={<div>Transações</div>} />
		</Routes>
	);
}
