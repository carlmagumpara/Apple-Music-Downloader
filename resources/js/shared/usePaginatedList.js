import { useState, useEffect } from 'react';
import { useFirestore, useFirestoreConnect } from 'react-redux-firebase';
import { useSelector } from 'react-redux';

export function usePaginatedList({ 
  collection, 
  conditions = {},
  page = 1, 
  perPage = 10,
  customFiltering = null
}) {
  const firestore = useFirestore();
  const auth = useSelector(({ firebase: { auth } }) => auth);
  useFirestoreConnect([{ collection, ...conditions }]);
  const snapshot = useSelector(({ firestore: { ordered } }) => ordered[conditions.storeAs ? conditions.storeAs : collection]);
  const items = customFiltering ? customFiltering(snapshot ?? []) : (snapshot ?? []);
  const [activePage, setActivePage] = useState(page);
  const totalPages = Math.ceil(items.length / perPage);
  const offset = perPage * (activePage - 1);
  const paginatedItems = items.slice(offset, perPage * activePage);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  return {
    isLoading: snapshot ? false : true,
    activePage,
    nextPage: ()=> setActivePage(p => p < totalPages ? p + 1 : p),
    previousPage: ()=> setActivePage(p => p > 1 ? p - 1 : p),
    totalPages,
    totalItems: items.length,
    data: paginatedItems,
  }
};