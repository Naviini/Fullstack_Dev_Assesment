import React, { useState, useEffect, FC } from 'react';
import axios from 'axios';
import '../styles/QualityManagement.css';

interface QualityCheck {
  _id?: string;
  standards: {
    category: string;
    description: string;
    acceptance: string;
    result: string;
  };
  qualityScore: number;
  status: string;
  comments: string;
}

interface QualityManagementProps {
  projectId: string;
}

const QualityManagement: FC<QualityManagementProps> = ({ projectId }) => {
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<QualityCheck>({
    standards: {
      category: 'functionality',
      description: '',
      acceptance: '',
      result: 'pending',
    },
    qualityScore: 0,
    status: 'in-progress',
    comments: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQualityChecks();
  }, [projectId]);

  const fetchQualityChecks = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/quality/project/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setQualityChecks(response.data.qualityChecks);
      setStatistics(response.data.statistics);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quality checks:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    if (name.startsWith('standards.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        standards: { ...prev.standards, [field]: value },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'qualityScore' ? parseInt(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5001/api/quality/${editingId}`, { ...formData, project: projectId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      } else {
        await axios.post('http://localhost:5001/api/quality', { ...formData, project: projectId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      }
      setFormData({
        standards: {
          category: 'functionality',
          description: '',
          acceptance: '',
          result: 'pending',
        },
        qualityScore: 0,
        status: 'in-progress',
        comments: '',
      });
      setEditingId(null);
      setShowForm(false);
      fetchQualityChecks();
    } catch (error) {
      console.error('Error saving quality check:', error);
    }
  };

  const handleEdit = (check: QualityCheck): void => {
    setFormData({
      standards: check.standards,
      qualityScore: check.qualityScore,
      status: check.status,
      comments: check.comments,
    });
    setEditingId(check._id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this quality check?')) {
      try {
        await axios.delete(`http://localhost:5001/api/quality/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchQualityChecks();
      } catch (error) {
        console.error('Error deleting quality check:', error);
      }
    }
  };

  const handleApprove = async (id: string, status: string): Promise<void> => {
    try {
      await axios.patch(`http://localhost:5001/api/quality/${id}/approve`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchQualityChecks();
    } catch (error) {
      console.error('Error approving quality check:', error);
    }
  };

  if (loading) return <div>Loading quality management...</div>;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  };

  return (
    <div className="quality-management">
      <div className="quality-header">
        <h2>✓ Quality Management</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Quality Check'}
        </button>
      </div>

      {statistics && (
        <div className="quality-statistics">
          <div className="stat-card">
            <h4>Total Checks</h4>
            <p className="stat-value">{statistics.totalChecks}</p>
          </div>
          <div className="stat-card">
            <h4>Pass Rate</h4>
            <p className="stat-value">{statistics.passRate}%</p>
          </div>
          <div className="stat-card">
            <h4>Avg Quality Score</h4>
            <p className={`stat-value ${getScoreColor(statistics.avgQualityScore)}`}>
              {statistics.avgQualityScore}
            </p>
          </div>
          <div className="stat-card">
            <h4>Failed Checks</h4>
            <p className="stat-value">{statistics.failedChecks}</p>
          </div>
        </div>
      )}

      {showForm && (
        <form className="quality-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Quality Category</label>
            <select name="standards.category" value={formData.standards.category} onChange={handleInputChange}>
              <option value="functionality">Functionality</option>
              <option value="performance">Performance</option>
              <option value="reliability">Reliability</option>
              <option value="usability">Usability</option>
              <option value="security">Security</option>
              <option value="documentation">Documentation</option>
            </select>
          </div>

          <div className="form-group">
            <label>Standard Description</label>
            <input
              type="text"
              name="standards.description"
              value={formData.standards.description}
              onChange={handleInputChange}
              placeholder="Describe the quality standard"
              required
            />
          </div>

          <div className="form-group">
            <label>Acceptance Criteria</label>
            <textarea
              name="standards.acceptance"
              value={formData.standards.acceptance}
              onChange={handleInputChange}
              placeholder="Define acceptance criteria"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Result</label>
              <select name="standards.result" value={formData.standards.result} onChange={handleInputChange}>
                <option value="pending">Pending</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quality Score (0-100)</label>
              <input
                type="number"
                name="qualityScore"
                value={formData.qualityScore}
                onChange={handleInputChange}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="in-progress">In Progress</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="conditional-pass">Conditional Pass</option>
            </select>
          </div>

          <div className="form-group">
            <label>Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              placeholder="Additional comments"
              rows={3}
            />
          </div>

          <button type="submit" className="btn-primary">
            {editingId ? 'Update Quality Check' : 'Add Quality Check'}
          </button>
        </form>
      )}

      <div className="quality-checks-list">
        {qualityChecks.map(check => (
          <div key={check._id} className={`quality-card ${check.status}`}>
            <div className="card-header">
              <h4>{check.standards.category}</h4>
              <span className={`status-badge ${check.status}`}>{check.status}</span>
            </div>
            <div className="card-body">
              <p><strong>Standard:</strong> {check.standards.description}</p>
              <p><strong>Acceptance:</strong> {check.standards.acceptance}</p>
              <div className="quality-score">
                <span>Quality Score:</span>
                <span className={`score ${getScoreColor(check.qualityScore)}`}>
                  {check.qualityScore}/100
                </span>
              </div>
              {check.comments && <p><strong>Comments:</strong> {check.comments}</p>}
            </div>
            <div className="card-actions">
              {check.status !== 'passed' && check.status !== 'failed' && (
                <>
                  <button
                    className="btn-sm btn-approve"
                    onClick={() => handleApprove(check._id || '', 'passed')}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-sm btn-reject"
                    onClick={() => handleApprove(check._id || '', 'failed')}
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                className="btn-sm btn-edit"
                onClick={() => handleEdit(check)}
              >
                Edit
              </button>
              <button
                className="btn-sm btn-delete"
                onClick={() => handleDelete(check._id || '')}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QualityManagement;
