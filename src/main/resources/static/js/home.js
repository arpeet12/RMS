;(function () {
  const { useState, useEffect } = React
  function JobCard({ job }) {
    return React.createElement(
      'div',
      { className: 'job-card' },
      React.createElement('img', {
        className: 'job-image',
        alt: 'Job Image',
        src: job.photoPath ? job.photoPath : 'https://via.placeholder.com/300x200?text=No+Image'
      }),
      React.createElement(
        'div',
        { className: 'job-content' },
        React.createElement('h3', { className: 'job-title' }, job.title),
        React.createElement(
          'div',
          { className: 'job-meta' },
          React.createElement(
            'div',
            { className: 'job-meta-item' },
            React.createElement('i', {
              className: 'fas fa-map-marker-alt',
              style: { width: '20px', color: 'var(--primary-color)' }
            }),
            React.createElement('span', null, job.country || '—')
          ),
          React.createElement(
            'div',
            { className: 'job-meta-item' },
            React.createElement('i', {
              className: 'fas fa-money-bill-wave',
              style: { width: '20px', color: 'var(--success)' }
            }),
            React.createElement('span', null, job.salary || '—')
          ),
          React.createElement(
            'div',
            { className: 'job-meta-item' },
            React.createElement('i', {
              className: 'fas fa-users',
              style: { width: '20px', color: 'var(--secondary-color)' }
            }),
            React.createElement('span', null, 'Vacancies: ' + (job.vacancyCount || 0))
          ),
          React.createElement(
            'div',
            { className: 'job-meta-item' },
            React.createElement('i', {
              className: 'fas fa-clock',
              style: { width: '20px', color: 'var(--danger)' }
            }),
            React.createElement('span', null, 'Deadline: ' + (job.deadline || '—'))
          )
        ),
        React.createElement('p', { className: 'job-description' }, job.description || ''),
        React.createElement(
          'a',
          { href: '/register', className: 'btn btn-primary', style: { marginTop: 'auto' } },
          'Apply Now'
        )
      )
    )
  }
  function JobGrid({ jobs }) {
    if (!jobs || jobs.length === 0) {
      return React.createElement(
        'div',
        { className: 'empty-state text-center', style: { padding: '4rem' } },
        React.createElement('i', {
          className: 'fas fa-briefcase',
          style: { fontSize: '4rem', color: '#ddd', marginBottom: '1rem' }
        }),
        React.createElement('h3', null, 'No Job Vacancies Available'),
        React.createElement('p', null, 'Please check back later for new opportunities.')
      )
    }
    return React.createElement(
      'div',
      { className: 'job-grid' },
      jobs.map(function (job) {
        return React.createElement(JobCard, { key: job.id, job: job })
      })
    )
  }
  function App() {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    useEffect(function () {
      fetch('/api/jobs')
        .then(function (res) {
          if (!res.ok) throw new Error('Failed to load jobs')
          return res.json()
        })
        .then(function (data) {
          setJobs(data || [])
        })
        .catch(function (err) {
          setError(err.message || 'Something went wrong')
        })
        .finally(function () {
          setLoading(false)
        })
    }, [])
    if (loading) {
      return React.createElement(
        'div',
        { className: 'text-center', style: { padding: '3rem' } },
        React.createElement('div', { className: 'loader' }, 'Loading jobs...')
      )
    }
    if (error) {
      return React.createElement(
        'div',
        { className: 'alert alert-danger text-center' },
        error
      )
    }
    return React.createElement(JobGrid, { jobs: jobs })
  }
  var rootEl = document.getElementById('job-grid-react')
  if (rootEl) {
    var root = ReactDOM.createRoot(rootEl)
    root.render(React.createElement(App))
  }
})()
