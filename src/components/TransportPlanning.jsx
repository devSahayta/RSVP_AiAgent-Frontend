//TransportPlanning.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bus,
  Plus,
  Trash2,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  DollarSign,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Download,
  ArrowLeft,
  Loader
} from 'lucide-react';
import '../styles/transport.css';

const TransportPlanning = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [vehicles, setVehicles] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [settings, setSettings] = useState({
    max_wait_minutes: 120,
    avg_distance_km: 30
  });

  // Vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    vehicle_name: '',
    vehicle_type: 'Bus',
    capacity: '',
    earliest_start_time: '13:30',
    assigned_location: ''
  });

  // Fetch existing vehicles on load
  useEffect(() => {
    fetchVehicles();
  }, [eventId]);

  const fetchVehicles = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/transport/vehicles/${eventId}`
      );
      const data = await res.json();
      if (data.success) {
        setVehicles(data.data);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.vehicle_name || !newVehicle.capacity) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/transport/add-vehicle`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: eventId,
            ...newVehicle,
            capacity: parseInt(newVehicle.capacity)
          })
        }
      );

      const data = await res.json();
      if (data.success) {
        setVehicles([...vehicles, data.data]);
        setNewVehicle({
          vehicle_name: '',
          vehicle_type: 'Bus',
          capacity: '',
          earliest_start_time: '13:30',
          assigned_location: ''
        });
        setShowVehicleForm(false);
        setError('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to add vehicle');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/transport/vehicle/${vehicleId}`,
        { method: 'DELETE' }
      );

      const data = await res.json();

      if (!res.ok) {
        if (data.error && data.error.includes('pickup plan')) {
          setError('⚠️ Cannot delete vehicle - it\'s being used in the current pickup plan. Please delete the plan first using the "Delete Plan" button below.');
        } else {
          setError(data.error || 'Failed to delete vehicle');
        }
        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (res.ok) {
        setVehicles(vehicles.filter(v => v.vehicle_id !== vehicleId));
        setError('');
      }
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setError('Failed to delete vehicle. Please try again.');
    }
  };

  const handleGeneratePlan = async () => {
    if (vehicles.length === 0) {
      setError('Please add at least one vehicle before generating a plan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/transport/generate-plan`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: eventId,
            ...settings
          })
        }
      );

      const data = await res.json();
      
      if (data.success) {
        // Fetch full plan details
        const planRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/transport/plan/${eventId}`
        );
        const planData = await planRes.json();
        
        if (planData.success) {
          setPlan(planData.data);
          
          // Check for unassigned passengers
          const totalPassengersInGroups = planData.data.pickup_groups.reduce(
            (sum, group) => sum + group.passenger_count, 
            0
          );
          const unassignedCount = planData.data.total_passengers - totalPassengersInGroups;
          
          if (unassignedCount > 0) {
            setError(
              `⚠️ Warning: ${unassignedCount} out of ${planData.data.total_passengers} passengers could not be assigned! ` +
              `Solutions: (1) Add more vehicles, OR (2) Increase max wait time to allow better grouping.`
            );
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (datetime) => {
    return new Date(datetime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleDeletePlan = async () => {
    if (!confirm('Are you sure you want to delete this plan? This will allow you to delete vehicles and generate a new plan.')) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/transport/plan/${plan.plan_id}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        setPlan(null);
        setError('');
        alert('Plan deleted successfully! You can now modify vehicles or generate a new plan.');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete plan');
      }
    } catch (err) {
      setError('Failed to delete plan. Please try again.');
    }
  };

  return (
    <div className="transport-container">
      {/* Header */}
      <div className="transport-header">
        <button 
          className="back-btn"
          onClick={() => navigate(`/event/${eventId}`)}
        >
          <ArrowLeft size={20} />
          Back to Event
        </button>
        <h1 className="transport-title">Transport Planning</h1>
        <p className="transport-subtitle">Optimize your guest pickup schedule</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Main Content */}
      <div className="transport-content">
        
        {/* Step 1: Available Vehicles */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Bus size={24} />
                Available Vehicles
              </h2>
              <p className="card-description">
                Add vehicles you have available for guest pickups
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowVehicleForm(!showVehicleForm)}
            >
              <Plus size={18} />
              Add Vehicle
            </button>
          </div>

          {/* Add Vehicle Form */}
          {showVehicleForm && (
            <div className="vehicle-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Vehicle Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Bus 1"
                    value={newVehicle.vehicle_name}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, vehicle_name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Vehicle Type *</label>
                  <select
                    value={newVehicle.vehicle_type}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, vehicle_type: e.target.value })
                    }
                  >
                    <option value="Bus">Bus</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                    <option value="Sedan">Sedan</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Capacity (seats) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g., 10"
                    value={newVehicle.capacity}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, capacity: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Earliest Start Time</label>
                  <input
                    type="time"
                    value={newVehicle.earliest_start_time}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, earliest_start_time: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Assigned Location (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Airport, Railway Station"
                    value={newVehicle.assigned_location}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, assigned_location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowVehicleForm(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleAddVehicle}>
                  {/* <Plus size={18} /> */}
                  Add Vehicle
                </button>
              </div>
            </div>
          )}

          {/* Vehicle List */}
          {vehicles.length === 0 ? (
            <div className="empty-state">
              <Bus size={48} />
              <h3>No Vehicles Added</h3>
              <p>Add your available vehicles to start planning</p>
            </div>
          ) : (
            <div className="vehicle-list">
              {vehicles.map((vehicle) => (
                <div key={vehicle.vehicle_id} className="vehicle-card">
                  <div className="vehicle-info">
                    <div className="vehicle-icon">
                      <Bus size={24} />
                    </div>
                    <div>
                      <h4>{vehicle.vehicle_name}</h4>
                      <div className="vehicle-details">
                        <span className="vehicle-type">{vehicle.vehicle_type}</span>
                        <span>•</span>
                        <span>{vehicle.capacity} seats</span>
                        {vehicle.assigned_location && (
                          <>
                            <span>•</span>
                            <span className="vehicle-location">
                              <MapPin size={14} />
                              {vehicle.assigned_location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDeleteVehicle(vehicle.vehicle_id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Optimization Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Clock size={24} />
              Optimization Settings
            </h2>
          </div>

          <div className="settings-grid">
            <div className="form-group">
              <label>
                Max Wait Time (minutes) *
                <span className="label-hint">How long can guests wait?</span>
              </label>
              <input
                type="number"
                min="30"
                max="300"
                step="30"
                value={settings.max_wait_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, max_wait_minutes: parseInt(e.target.value) })
                }
              />
            </div>

            {/* <div className="form-group">
              <label>
                Average Distance (km)
                <span className="label-hint">For cost calculation</span>
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={settings.avg_distance_km}
                onChange={(e) =>
                  setSettings({ ...settings, avg_distance_km: parseInt(e.target.value) })
                }
              />
            </div> */}
          </div>
        </div>

        {/* Step 3: Generate Plan */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Generate Pickup Plan</h2>
          </div>

          <button
            className="btn btn-generate"
            onClick={handleGeneratePlan}
            disabled={loading || vehicles.length === 0}
          >
            {loading ? (
              <>
                <Loader size={20} className="spin" />
                Generating...
              </>
            ) : (
              <>
                <ChevronRight size={20} />
                Generate Optimized Plan
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {plan && (
          <>
            {/* Unassigned Passengers Warning */}
            {(() => {
              const totalAssigned = plan.pickup_groups.reduce(
                (sum, group) => sum + group.passenger_count, 
                0
              );
              const unassigned = plan.total_passengers - totalAssigned;
              
              if (unassigned > 0) {
                return (
                  <div className="alert alert-warning">
                    <AlertCircle size={20} />
                    <div>
                      <strong>⚠️ {unassigned} Passengers Unassigned</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                        Only {totalAssigned} out of {plan.total_passengers} passengers were assigned. 
                        <br />
                        <strong>Solutions:</strong> Add more vehicles OR increase max wait time.
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Summary Stats */}
            <div className="stats-grid">
              <div className="stat-card stat-primary">
                <div className="stat-icon">
                  <Bus size={24} />
                </div>
                <div>
                  <div className="stat-value">{plan.total_vehicles_used}</div>
                  <div className="stat-label">Vehicles Used</div>
                </div>
              </div>

              <div className="stat-card stat-success">
                <div className="stat-icon">
                  <TrendingDown size={24} />
                </div>
                <div>
                  <div className="stat-value">{plan.vehicles_saved}</div>
                  <div className="stat-label">Vehicles Saved</div>
                </div>
              </div>

              <div className="stat-card stat-warning">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="stat-value">{plan.avg_wait_time_minutes} min</div>
                  <div className="stat-label">Avg Wait Time</div>
                </div>
              </div>

              {/* <div className="stat-card stat-money">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div>
                  <div className="stat-value">{formatCurrency(plan.cost_saved)}</div>
                  <div className="stat-label">Cost Saved</div>
                </div>
              </div> */}
            </div>

            {/* Pickup Groups */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <CheckCircle size={24} />
                  Pickup Schedule
                </h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="export-dropdown">
                    <button className="btn btn-secondary">
                      <Download size={18} />
                      Export Plan ▼
                    </button>
                    <div className="export-menu">
                      <a 
                        href={`${import.meta.env.VITE_BACKEND_URL}/api/transport/export/pdf/${plan.plan_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="export-menu-item"
                      >
                        <Download size={16} />
                        Export as PDF
                      </a>
                      <a 
                        href={`${import.meta.env.VITE_BACKEND_URL}/api/transport/export/excel/${plan.plan_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="export-menu-item"
                      >
                        <Download size={16} />
                        Export as Excel
                      </a>
                    </div>
                  </div>
                  <button 
                    className="btn btn-danger-outline"
                    onClick={handleDeletePlan}
                  >
                    <Trash2 size={18} />
                    Delete Plan
                  </button>
                </div>
              </div>

              <div className="groups-container">
                {plan.pickup_groups.map((group, index) => (
                  <div key={group.group_id} className="group-card">
                    <div className="group-header">
                      <div className="group-title">
                        <Bus size={20} />
                        <h3>
                          {group.vehicle_name}
                          <span className="group-number">Vehicle #{group.vehicle_number}</span>
                        </h3>
                      </div>
                      <div className="group-meta">
                        <span className="badge badge-location">
                          <MapPin size={14} />
                          {group.pickup_location}
                        </span>
                        <span className="badge badge-passengers">
                          <Users size={14} />
                          {group.passenger_count}/{group.vehicle_capacity}
                        </span>
                      </div>
                    </div>

                    <div className="group-timeline">
                      <div className="timeline-item">
                        <Clock size={16} />
                        <div>
                          <strong>Arrival:</strong> {formatTime(group.vehicle_arrival_time)}
                        </div>
                      </div>
                      <div className="timeline-item">
                        <Users size={16} />
                        <div>
                          <strong>First Pickup:</strong> {formatTime(group.first_passenger_arrival)}
                        </div>
                      </div>
                      <div className="timeline-item">
                        <CheckCircle size={16} />
                        <div>
                          <strong>Depart:</strong> {formatTime(group.vehicle_departure_time)}
                        </div>
                      </div>
                    </div>

                    <div className="group-stats">
                      <div className="stat-item">
                        <span className="stat-label">Avg Wait:</span>
                        <span className="stat-value">{group.avg_wait_time_minutes} min</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Max Wait:</span>
                        <span className={`stat-value ${group.max_wait_time_minutes > 90 ? 'text-warning' : ''}`}>
                          {group.max_wait_time_minutes} min
                        </span>
                      </div>
                    </div>

                    {/* Passenger List */}
                    <details className="passenger-details">
                      <summary>
                        View {group.passenger_count} Passengers
                        <ChevronRight size={16} />
                      </summary>
                      <div className="passenger-list">
                        {group.passengers_details.map((passenger, i) => (
                          <div key={i} className="passenger-item">
                            <div className="passenger-info">
                              <div className="passenger-number">{i + 1}</div>
                              <div>
                                <div className="passenger-name">{passenger.name}</div>
                                <div className="passenger-phone">{passenger.phone}</div>
                              </div>
                            </div>
                            <div className="passenger-time">
                              <Clock size={14} />
                              {formatTime(passenger.pickup_time)}
                              <span className={`wait-badge ${passenger.wait_minutes > 60 ? 'wait-long' : ''}`}>
                                Wait: {passenger.wait_minutes}m
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>

                    <div className="driver-instructions">
                      <strong>Driver Instructions:</strong>
                      <p>{group.driver_instructions}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransportPlanning;