import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import {
  fetchProductsThunk,
  fetchProductByIdThunk,
  fetchCategoriesThunk
} from '@/features/product/productThunks'
import { setFilter, clearFilter, setSelectedProduct } from '@/features/product/productSlices'
import type { ProductFilter, Product } from '@/types/api'

export const useProduct = () => {
  const dispatch = useAppDispatch()
  const { products, selectedProduct, filter, pagination, categories, isLoading, error } =
    useAppSelector((state) => state.product)

  const fetchProducts = useCallback(
    (filterParams?: ProductFilter) => {
      dispatch(fetchProductsThunk(filterParams || filter))
    },
    [dispatch, filter]
  )

  const fetchProductById = useCallback(
    (id: string) => {
      dispatch(fetchProductByIdThunk(id))
    },
    [dispatch]
  )

  const fetchCategories = useCallback(() => {
    dispatch(fetchCategoriesThunk())
  }, [dispatch])

  const updateFilter = useCallback(
    (newFilter: ProductFilter) => {
      dispatch(setFilter(newFilter))
    },
    [dispatch]
  )

  const resetFilter = useCallback(() => {
    dispatch(clearFilter())
  }, [dispatch])

  const selectProduct = useCallback(
    (product: Product | null) => {
      dispatch(setSelectedProduct(product))
    },
    [dispatch]
  )

  // Fetch products when filter changes
  useEffect(() => {
    dispatch(fetchProductsThunk(filter))
  }, [dispatch, filter])

  return {
    products,
    selectedProduct,
    filter,
    pagination,
    categories,
    isLoading,
    error,
    fetchProducts,
    fetchProductById,
    fetchCategories,
    updateFilter,
    resetFilter,
    selectProduct
  }
}

export default useProduct
