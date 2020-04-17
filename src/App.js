import React, { Fragment, useState, useEffect, useReducer } from 'react';
import axios from 'axios';

const dataFetchReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false
            }
        case 'FETCH_SUCCESS':
            console.log(action.payload.hits)
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload
            }
        case 'FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true,
            };
        default:
            throw new Error();

    }

}

const useHackerNewApi = (initialUrl, initialData) => {
    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: false,
        isError: false,
        data: initialData,
    });
    const [url, setUrl] = useState(initialUrl)

    useEffect(() => {
        let didCancel = false;
        async function fetchData() {
            dispatch({ type: 'FETCH_INIT' });
            try {
                const result = await axios(url);
                if (!didCancel) {
                    dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
                }
            } catch (e) {
                if (!didCancel) {
                    dispatch({ type: 'FETCH_FAILURE' });
                }
            }
        };
        fetchData()
        return () => {
            didCancel = true;
        }
    }, [url])
    return [state, setUrl]
}

function App() {

    const [{ data, isLoading, isError }, setUrl] = useHackerNewApi(
        'https://hn.algolia.com/api/v1/search?query=redux',
        { hits: [] },
    );
    const [query, setQuery] = useState('redux')
    return (
        <Fragment>
            <form
                onSubmit={(event) => { setUrl(`https://hn.algolia.com/api/v1/search?query=${query}`); event.preventDefault() }}
            >
                <input type='text' value={query} onChange={(event) => setQuery(event.target.value)} />
                <button type='submit'>search:</button>
            </form>
            {isError && <div>Something went wrong ...</div>}
            {isLoading ?
                (<div>Loading ...</div>)
                : (<ul>

                    {data.hits.map((item, index) =>
                        (<li key={index}>
                            <a href={item.url}>{item.title}</a>
                        </li>)
                    )}
                </ul>)}
        </Fragment>
    )
}

export default App;