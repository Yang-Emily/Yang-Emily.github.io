import { ExternalLink } from 'lucide-react'

const Publications = () => {
  const publications = [
    
    {
      title: 'Can Large Language Models Serve as Evaluators for Code Summarization?',
      authors: ['Yang Wu', 'Yao Wan', 'Zhaoyang Chu', 'Wenting Zhao', 'Ye Liu', 'Hongyu Zhang', 'Xuanhua Shi', 'Hai Jin', 'Philip S. Yu'],
      venue: 'IEEE TSE',
      venueLevel: 'CCF-A',
      year: '2025',
      tags: ['LLM', 'Code Summarization', 'Evaluation'],
      thumbnail: 'llm-eval.png',
      links: {
        paper: 'https://ieeexplore.ieee.org/abstract/document/11129179',
        doi: 'https://ieeexplore.ieee.org/abstract/document/11129179',
      },
    },
    {
      title: 'Sign2Vis: Automated Data Visualization from Sign Language',
      authors: ['Yao Wan', 'Yang Wu', 'Zhen Li', 'Guobiao Zhang', 'Hongyu Zhang', 'Zhou Zhao', 'Hai Jin', 'April Wang'],
      venue: 'ACL 2025',
      venueLevel: 'CCF-A',
      year: '2025',
      tags: ['Sign Language', 'Accessibility', 'Data Visualization', 'HCI'],
      thumbnail: 'sign2vis.png',
      links: {
        paper: 'https://aclanthology.org/2025.findings-acl.918/',
        doi: 'https://aclanthology.org/2025.findings-acl.918/',
      },
    },
    {
      title: 'Automated Data Visualization from Natural Language via Large Language Models: An Exploratory Study',
      authors: ['Yang Wu', 'Yao Wan', 'Hongyu Zhang', 'Yulei Sui', 'Wucai Wei', 'Wei Zhao', 'Guandong Xu', 'Hai Jin'],
      venue: 'SIGMOD 2024',
      venueLevel: 'CCF-A',
      year: '2024',
      tags: ['Data Visualization', 'NLP', 'LLM'],
      thumbnail: 'nl2vis.png',
      links: {
        paper: 'https://dl.acm.org/doi/abs/10.1145/3654992',
        doi: 'https://dl.acm.org/doi/abs/10.1145/3654992',
      },
    },
      {
      title: 'Graph Neural Networks for Vulnerability Detection: A Counterfactual Explanation',
      authors: ['Zhaoyang Chu', 'Yao Wan', 'Qian Li', 'Yang Wu', 'Hongyu Zhang', 'Yulei Sui', 'Guandong Xu', 'Hai Jin'],
      venue: 'ISSTA 2024',
      venueLevel: 'CCF-A',
      year: '2024',
      tags: ['Explainability', 'GNN', 'Security'],
      thumbnail: 'gnn-vuln.png',
      links: {
        paper: 'https://dl.acm.org/doi/abs/10.1145/3650212.3652136',
        doi: 'https://dl.acm.org/doi/abs/10.1145/3650212.3652136',
      },
    },
  ]

  // 渲染作者列表，突出 Yang Wu
  const renderAuthors = (authors) => {
    return authors.map((author, index) => {
      const isYangWu = author === 'Yang Wu'
      return (
        <span key={index}>
          <span className={isYangWu ? 'font-bold text-gray-900' : 'text-gray-600'}>
            {author}
          </span>
          {index < authors.length - 1 && ', '}
        </span>
      )
    })
  }

  return (
    <div>
      {/* Section header */}
      <div className="mb-4">
        <h2 className="text-2xl font-serif font-bold mb-3 text-gray-900">Publications</h2>
      </div>

        {/* Publications list */}
        <div className="space-y-8">
          {publications.map((pub, index) => (
            <div
              key={index}
              className="flex gap-6 pb-8 border-b border-gray-200 last:border-0"
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-64 h-32">
                <div className="w-full h-full bg-gray-100 rounded border border-gray-200 overflow-hidden">
                  <img 
                    src={`${import.meta.env.BASE_URL}${pub.thumbnail}`}
                    alt={pub.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No preview</div>'
                    }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                  {pub.title}
                </h3>

                {/* Authors */}
                <p className="text-sm text-gray-600 mb-2">
                  {renderAuthors(pub.authors)}
                </p>

                {/* Venue and Level */}
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <span className="font-medium text-gray-900">{pub.venue}</span>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded">
                    {pub.venueLevel}
                  </span>
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-2">
                  {pub.links.paper && (
                    <a
                      href={pub.links.paper}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink size={14} />
                      Paper
                    </a>
                  )}
                  {pub.links.doi && (
                    <a
                      href={pub.links.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink size={14} />
                      DOI
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      {/* Google Scholar link */}
      <div className="mt-6">
        <a
          href="https://scholar.google.com/citations?user=2RdXwUwAAAAJ"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <ExternalLink size={16} />
          Google Scholar Profile
        </a>
      </div>
    </div>
  )
}

export default Publications
