import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout/Layout'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Checkbox } from 'antd'
import { useCart } from '../context/cart'
import toast  from 'react-hot-toast'
const HomePage = () => {
  const navigate = useNavigate()
  const [cart,setCart]=useCart()
  const [sites, setSites] = useState([])
  const [categories, setCategories] = useState([])
  const [checked, setChecked] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(1)


  //get allcategory
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("http://localhost:8080/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);

    }
  };

  useEffect(() => {
    getAllCategory();
    getTotal();
  }, []);
  //get sites
  const getAllSites = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`/api/v1/site/site-list/${page}`);
      setLoading(false)
      setSites(data.sites);

    }
    catch (error) {
      setLoading(false)
      console.log(error);
    }
  };
  //get Total count
  const getTotal = async () => {
    try {
      const { data } = await axios.get('/api/v1/site/site-count')
      setTotal(data?.total)

    }
    catch (error) {
      console.log(error)
    }
  };
  useEffect(() => {
    if (page == 1) return
    loadMore()
  }, [page])
  //load more
  const loadMore = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`/api/v1/site/site-list/${page}`)
      setLoading(false)
      setSites([...sites, ...data?.sites])
    }
    catch (error) {
      console.log(error)
      setLoading(false)

    }
  }

  //filter by category
  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    }
    else {
      all = all.filter(c => c !== id);
    }
    setChecked(all);

  };

  useEffect(() => {
    if (!checked.length) getAllSites();
  }, [checked.length]);
  useEffect(() => {
    if (checked.length) filterSite();
  }, [checked])
  //get filtered sites
  const filterSite = async () => {
    try {
      const { data } = await axios.post('api/v1/site/site-filters', { checked })
      setSites(data?.sites)

    }
    catch (error) {
      console.log(error)

    }
  }



  return (
    <Layout title={"All Sites - Best offers"}>
      <div className="row mt-2">
        <div className="col-md-3">
          <h4 className="text-center">Filter By category</h4 >
          <div className="d-flex flex-column">
            {categories?.map((c) => (
              <Checkbox key={c._id} onChange={(e) => handleFilter(e.target.checked, c._id)}>
                {c.name}
              </Checkbox>
            ))}
          </div>
        </div>




        <div className="col-md-9">
          <h1 className="text-center">All Sites</h1>
          {JSON.stringify(checked, null, 4)}
          <div className="d-flex flex-wrap">
            {sites?.map(s => (
              <div className="card m-2" style={{ width: '18rem' }} >
                <img src={`/api/v1/site/site-photo/${s._id}`} className="card-img-top" alt="{s.name}" />
                <div className="card-body">
                  <h5 className="card-title">{s.name}</h5>
                  <p className="ca{rd-text">{s.description}</p>
                  <button class="btn btn-primary ms-1" onClick={() => navigate(`/site/${s.slug}`)}>More Details</button>
                  <button class="btn btn-secondary ms-1" onClick={()=>{setCart([...cart,s]);
                    localStorage.setItem('cart',JSON.stringify([...cart,s]))
                    toast.success('Item added to Cart')}}>Add to Cart</button>


                </div>
              </div>
            ))}
          </div>
          <div className='m-2 p-3'>
            {sites && sites.length < total && (
              <button className='btn btn-warning'
                onClick={(e) => {
                  e.preventDefault()
                  setPage(page + 1);
                }}>
                {loading ? "Loading..." : "Loadmore"}
              </button>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default HomePage