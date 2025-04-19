import {BrowserRouter} from "react-router";
import AnimatedRoutes from "./routes";
import Header from "./components/layout/header/Header.tsx";
import {Provider} from "react-redux";
import store from "./store";

function App() {

    return (
        <Provider store={store}>
            <div className="App">
                <BrowserRouter>
                    <Header/>
                    <AnimatedRoutes/>
                </BrowserRouter>
            </div>
        </Provider>
    )
}

export default App
