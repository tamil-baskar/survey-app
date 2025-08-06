import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// Add this helper function at the top of the file, after the imports
function getBestMatch(description, keywords) {
  const desc = description.toLowerCase();
  
  // Simple string similarity function (Levenshtein distance based)
  const similarity = (s1, s2) => {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    
    if (longerLength === 0) return 1.0;
    
    // If any keyword is a substring of the description, it's a match
    if (desc.includes(shorter)) return 1.0;
    
    // Check for common typos and variations
    const commonTypos = {
      'employee': ['employe', 'empolyee', 'employ', 'emploee'],
      'student': ['stdent', 'studnt', 'studen'],
      'customer': ['costomer', 'custmer', 'customr'],
      'satisfaction': ['satisfacion', 'satisfacshun', 'satisfac'],
      'feedback': ['feedbak', 'fedbak', 'feedbac'],
      'research': ['reserch', 'reaserch', 'resarch'],
      'usability': ['usablity', 'useability', 'usabilty'],
      'onboarding': ['onbording', 'onbording', 'onbord'],
      'demographic': ['demografic', 'demographc', 'demograph']
    };
    
    // Check for common typos
    if (commonTypos[shorter]) {
      for (const typo of commonTypos[shorter]) {
        if (desc.includes(typo)) return 0.9; // High confidence for known typos
      }
    }
    
    // Check for partial matches (e.g., "cust" in "customer")
    if (shorter.length >= 4 && desc.includes(shorter.substring(0, 4))) {
      return 0.8; // High confidence for partial matches
    }
    
    return 0; // No match
  };
  
  // Find the best matching keyword
  let bestMatch = '';
  let highestScore = 0;
  
  for (const keyword of keywords) {
    const score = similarity(keyword, desc);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = keyword;
    }
  }
  
  // Only return a match if we have a high enough confidence
  return highestScore > 0.7 ? bestMatch : null;
}

function generateQuestions(description) {
  const questions = [];
  const desc = description.toLowerCase();
  
  // Define our survey templates with their keywords
  const templates = [
    {
      keywords: ['student', 'school', 'college', 'university', 'education'],
      questions: [
        'What is your full name?',
        'What is your sex?',
        'What is your age?',
        'What is your grade or year?',
        'What is your major or field of study?',
        'What is your student ID?',
        'What is your contact number?'
      ]
    },
    {
      keywords: ['employee', 'staff', 'worker', 'personnel'],
      questions: [
        'What is your full name?',
        'What is your sex?',
        'What is your age?',
        'What is your job title?',
        'What is your department?',
        'What are your key skills?',
        'What is your availability?',
        'What is your employee ID?'
      ]
    },
    // ... [rest of your templates with their keywords]
    // Customer Satisfaction Survey
    {
      keywords: ['customer satisfaction', 'client happiness', 'service feedback'],
      questions: [
        'How satisfied are you with our product/service? (1-5)',
        'How likely are you to recommend us to others? (1-10)',
        'What did you like most about your experience?',
        'What could we improve?',
        'How would you rate our customer support? (1-5)',
        'Would you use our product/service again?'
      ]
    },
    // Market Research Survey
    {
      keywords: ['market research', 'market analysis'],
      questions: [
        'How often do you purchase [product/service]?',
        'What factors influence your purchasing decision?',
        'How much do you typically spend on [product/service]?',
        'Which brands do you prefer and why?',
        'What improvements would you like to see in this market?'
      ]
    },
    // Product Feedback Survey
    {
      keywords: ['product feedback', 'product review'],
      questions: [
        'How would you rate this product? (1-5)',
        'What do you like about this product?',
        'What do you dislike about this product?',
        'How does this product compare to similar ones you\'ve used?',
        'Would you recommend this product to others?'
      ]
    },
    // Event Feedback Survey
    {
      keywords: ['event feedback', 'event survey'],
      questions: [
        'How would you rate the event overall? (1-5)',
        'What was your favorite part of the event?',
        'How could we improve future events?',
        'Were the event speakers/presentations valuable?',
        'Would you attend this event again?'
      ]
    },
    // Training Feedback Survey
    {
      keywords: ['training feedback', 'training evaluation'],
      questions: [
        'How would you rate the training content? (1-5)',
        'How effective was the trainer?',
        'What was the most valuable thing you learned?',
        'How could we improve this training?',
        'Would you recommend this training to others?'
      ]
    },
    // Website Feedback Survey
    {
      keywords: ['website feedback', 'website survey'],
      questions: [
        'How easy was it to find what you were looking for? (1-5)',
        'What was your main reason for visiting our website today?',
        'How would you rate the website\'s design? (1-5)',
        'Did you encounter any technical issues?',
        'How likely are you to return to our website?'
      ]
    },
    // Brand Awareness Survey
    {
      keywords: ['brand awareness', 'brand survey'],
      questions: [
        'Have you heard of our brand before?',
        'How did you first hear about us?',
        'What words come to mind when you think of our brand?',
        'How likely are you to purchase from us in the future?',
        'Which of our competitors are you familiar with?'
      ]
    },
    // Usability Testing Survey
    {
      keywords: ['usability', 'user testing'],
      questions: [
        'How easy was it to complete your task? (1-5)',
        'What challenges did you encounter?',
        'How would you rate the navigation? (1-5)',
        'What did you like about the interface?',
        'What would you improve about the interface?'
      ]
    },
    // Net Promoter Score (NPS) Survey
    {
      keywords: ['nps', 'net promoter'],
      questions: [
        'On a scale of 0-10, how likely are you to recommend us to a friend or colleague?',
        'What is the primary reason for your score?',
        'What could we do to improve your experience?'
      ]
    },
    // Exit Interview Survey
    {
      keywords: ['exit interview', 'employee exit'],
      questions: [
        'What is your primary reason for leaving?',
        'How would you rate your overall experience working here? (1-5)',
        'What did you enjoy most about working here?',
        'What could we have done better?',
        'Would you consider working here again in the future?'
      ]
    },
    // Course Evaluation Survey
    {
      keywords: ['course evaluation', 'course feedback'],
      questions: [
        'How would you rate the course content? (1-5)',
        'How effective was the instructor?',
        'What was the most valuable thing you learned?',
        'How could this course be improved?',
        'Would you recommend this course to others?'
      ]
    },
    // Health & Wellness Survey
    {
      keywords: ['health', 'wellness'],
      questions: [
        'How would you rate your overall health? (1-5)',
        'How often do you exercise?',
        'How many hours of sleep do you typically get?',
        'What are your main health concerns?',
        'What wellness programs would you be interested in?'
      ]
    },
    // Educational Feedback Survey
    {
      keywords: ['educational', 'school survey'],
      questions: [
        'How would you rate the quality of education? (1-5)',
        'What do you like most about this institution?',
        'What areas need improvement?',
        'How effective are the teaching methods?',
        'Would you recommend this institution to others?'
      ]
    },
    // Voting / Poll Survey
    {
      keywords: ['voting', 'poll', 'election'],
      questions: [
        'Which option do you support?',
        'How strongly do you feel about this issue? (1-5)',
        'What factors influenced your decision?',
        'Would you like to receive updates about this issue?'
      ]
    },
    // Demographic Survey
    {
      keywords: ['demographic', 'demographics'],
      questions: [
        'What is your age group?',
        'What is your gender?',
        'What is your highest level of education?',
        'What is your employment status?',
        'What is your household income range?'
      ]
    },
    // Political Opinion Survey
    {
      keywords: ['political', 'election poll'],
      questions: [
        'Which political party do you most identify with?',
        'How would you rate the current administration? (1-5)',
        'What are your top policy concerns?',
        'How likely are you to vote in the next election?'
      ]
    },
    // Social Research Survey
    {
      keywords: ['social research', 'social study'],
      questions: [
        'How would you describe your social media usage?',
        'What social issues are most important to you?',
        'How do you typically stay informed about current events?',
        'How would you rate your level of social engagement? (1-5)'
      ]
    },
    // HR Onboarding Survey
    {
      keywords: ['onboarding', 'new hire'],
      questions: [
        'How would you rate your onboarding experience? (1-5)',
        'Did you receive all the necessary information to start your role?',
        'What could we improve about the onboarding process?',
        'Do you feel welcomed by your team?',
        'Do you have all the tools and access you need?'
      ]
    },
    // Public Opinion Survey
    {
      keywords: ['public opinion', 'community survey'],
      questions: [
        'How would you rate your satisfaction with local services? (1-5)',
        'What are the most important issues facing our community?',
        'How could local government better serve residents?',
        'How safe do you feel in your neighborhood? (1-5)'
      ]
    }
  ];
  
  // Find the best matching template
  let matchedTemplate = null;
  
  for (const template of templates) {
    const bestMatch = getBestMatch(desc, template.keywords);
    if (bestMatch) {
      matchedTemplate = template;
      console.log(`Matched template with keyword: ${bestMatch}`);
      break;
    }
  }
  
  // If we found a matching template, use its questions
  if (matchedTemplate) {
    return [...matchedTemplate.questions]; // Return a copy of the questions
  }
  
  // Default questions if no match found
  return [
    'What is your name?',
    'What is your email address?',
    'How did you hear about us?',
    'What is your main reason for taking this survey?',
    'Do you have any additional comments or feedback?'
  ];
}

function Dashboard({ user, onLogout, onCreateSurvey, surveys, onDeleteSurvey }) {
  // Filter surveys created by the current user
  const userSurveys = Object.values(surveys).filter(
    survey => survey.owner === user.username
  );

  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [copiedSurveyId, setCopiedSurveyId] = useState(null);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const copyToClipboard = (surveyId) => {
    const url = `${window.location.origin}/survey/${surveyId}`;
    navigator.clipboard.writeText(url);
    setCopiedSurveyId(surveyId);
    setTimeout(() => setCopiedSurveyId(null), 2000);
  };

  const handleViewResponses = (survey) => {
    setSelectedSurvey(survey);
    setShowDeleteConfirm(null); // Close any open delete confirmations
  };

  const handleCloseResponses = () => {
    setSelectedSurvey(null);
  };

  const handleDeleteClick = (surveyId, e) => {
    e.stopPropagation(); // Prevent triggering the view responses
    setShowDeleteConfirm(surveyId);
  };

  const confirmDelete = (surveyId) => {
    onDeleteSurvey(surveyId);
    setShowDeleteConfirm(null);
    if (selectedSurvey && selectedSurvey.id === surveyId) {
      setSelectedSurvey(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const exportToExcel = (survey) => {
    // Prepare the data for Excel export
    const data = [];
    
    // Add header row with question titles
    const headers = ['Response ID', 'Submission Date', ...survey.questions];
    data.push(headers);
    
    // Add response data
    if (survey.responses && survey.responses.length > 0) {
      survey.responses.forEach(response => {
        const row = [
          response.id,
          new Date(response.submittedAt).toLocaleString(),
          ...survey.questions.map((_, index) => response.answers[index] || '')
        ];
        data.push(row);
      });
    } else {
      // If no responses, add a message
      data.push(['No responses yet']);
    }
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    const colWidths = survey.questions.map(q => ({
      wch: Math.min(Math.max(q.length, 20), 50) // Set width based on question length (min 20, max 50)
    }));
    ws['!cols'] = [{wch: 15}, {wch: 20}, ...colWidths];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Survey Responses');
    
    // Generate filename with survey title and current date
    const fileName = `${survey.title.replace(/[^\w\s]/gi, '')}_responses_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save the file
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Welcome, {user.username}!</h2>
        <div>
          <button 
            onClick={onCreateSurvey}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Create New Survey
          </button>
          <button 
            onClick={onLogout}
            style={{
              padding: '10px 20px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>Your Surveys</h3>
        {userSurveys.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <p>You haven't created any surveys yet.</p>
            <button 
              onClick={onCreateSurvey}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Create Your First Survey
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            {userSurveys.map((survey) => (
              <div key={survey.id} style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 10px 0' }}>{survey.title}</h4>
                  <p style={{ margin: '5px 0', color: '#666' }}>{survey.description || 'No description'}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#888' }}>
                    Created: {formatDate(survey.createdAt)}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#888' }}>
                    Responses: {survey.responses?.length || 0}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => handleViewResponses(survey)}
                    style={{
                      padding: '8px 16px',
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>👁️</span> View Responses
                  </button>
                  <button
                    onClick={() => exportToExcel(survey)}
                    style={{
                      padding: '8px 16px',
                      background: '#673AB7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                      transition: 'background 0.2s'
                    }}
                  >
                    <span>📊</span> Export to Excel
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => handleDeleteClick(survey.id, e)}
                      style={{
                        padding: '8px 16px',
                        background: showDeleteConfirm === survey.id ? '#ff4444' : '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'background 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseLeave={cancelDelete}
                    >
                      <span>🗑️</span> {showDeleteConfirm === survey.id ? 'Confirm?' : 'Delete'}
                    </button>
                    
                    {showDeleteConfirm === survey.id && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '5px',
                        backgroundColor: 'white',
                        padding: '10px',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        zIndex: 10,
                        width: '200px'
                      }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Delete this survey? This cannot be undone.</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); cancelDelete(); }}
                            style={{
                              padding: '4px 8px',
                              background: '#f0f0f0',
                              border: '1px solid #ddd',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); confirmDelete(survey.id); }}
                            style={{
                              padding: '4px 8px',
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Yes, Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(survey.id)}
                    style={{
                      padding: '8px 16px',
                      background: copiedSurveyId === survey.id ? '#4CAF50' : '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                      transition: 'background 0.2s'
                    }}
                  >
                    {copiedSurveyId === survey.id ? (
                      <>
                        <span>✓</span> Copied!
                      </>
                    ) : (
                      <>
                        <span>📋</span> Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSurvey && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{selectedSurvey.title} - Responses</h3>
              <button 
                onClick={handleCloseResponses}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            {selectedSurvey.responses?.length > 0 ? (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h4>Questions:</h4>
                  <ol>
                    {selectedSurvey.questions.map((q, i) => (
                      <li key={i} style={{ marginBottom: '8px' }}>{q}</li>
                    ))}
                  </ol>
                </div>
                
                <h4>Responses ({selectedSurvey.responses.length}):</h4>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                  {selectedSurvey.responses.map((response, idx) => (
                    <div key={response.id} style={{ 
                      padding: '15px', 
                      borderBottom: '1px solid #eee',
                      backgroundColor: idx % 2 === 0 ? '#f9f9f9' : 'white'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                        Response #{idx + 1} - {new Date(response.submittedAt).toLocaleString()}
                      </div>
                      <div>
                        {Object.entries(response.answers).map(([qIdx, answer]) => (
                          <div key={qIdx} style={{ marginBottom: '8px' }}>
                            <div style={{ fontWeight: '500' }}>{selectedSurvey.questions[qIdx]}</div>
                            <div style={{ marginLeft: '15px', color: '#333' }}>
                              {answer || <span style={{ color: '#999' }}>No answer provided</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No responses yet.</p>
            )}
            
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={handleCloseResponses}
                style={{
                  padding: '8px 16px',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateSurvey({ onBack, onNext }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleNext = (e) => {
    e.preventDefault();
    if (!title || !description) return;
    const questions = generateQuestions(description);
    onNext({ title, description, questions });
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#f5f6fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: 40, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minWidth: 350, maxWidth: 700, width: '100%' }}>
        <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Create Survey</h2>
        <form onSubmit={handleNext}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 'bold' }}>Survey Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 4, border: '1px solid #ccc', fontSize: 16 }}
              placeholder="Enter survey title"
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 'bold' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 4, border: '1px solid #ccc', fontSize: 16, minHeight: 80 }}
              placeholder="Enter survey description"
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: 14, background: '#1976d2', color: 'white', border: 'none', borderRadius: 6, fontSize: 18, fontWeight: 'bold', cursor: 'pointer', marginBottom: 16 }}>
            Next (Add Questions)
          </button>
        </form>
        <button onClick={onBack} style={{ width: '100%', marginTop: 10, padding: 10, background: '#eee', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

function ShareSurveyLink({ surveyId, onClose }) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/survey/${surveyId}`;
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="500px" frameborder="0" style="border: 1px solid #ddd;"></iframe>`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    // Close the modal and return to dashboard after 1.5 seconds
    setTimeout(() => {
      setCopied(false);
      onClose(); // This will close the modal and return to dashboard
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0 }}>Survey Created Successfully! 🎉</h2>
        
        <div style={{ marginBottom: '24px' }}>
          <h4>Public Survey Link</h4>
          <p>Share this link with anyone to collect responses (no login required):</p>
          <div style={{
            display: 'flex',
            margin: '8px 0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <input
              type="text"
              value={publicUrl}
              readOnly
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                backgroundColor: '#f8f9fa'
              }}
            />
            <button
              onClick={() => copyToClipboard(publicUrl)}
              style={{
                padding: '8px 16px',
                background: copied ? '#4CAF50' : '#1976d2',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background 0.2s'
              }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4>Embed in Website</h4>
          <p>Copy and paste this code into your website HTML:</p>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '12px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px',
            overflowX: 'auto',
            marginBottom: '12px'
          }}>
            {embedCode}
          </div>
          <button
            onClick={() => copyToClipboard(embedCode)}
            style={{
              padding: '8px 16px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Copy Embed Code
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f8f9fa',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Close
          </button>
          <button
            onClick={() => window.open(publicUrl, '_blank')}
            style={{
              padding: '10px 20px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            View Survey
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewQuestions({ survey, onBack, onCreateSurvey }) {
  const [questions, setQuestions] = useState(survey.questions);
  const [showShareLink, setShowShareLink] = useState(false);
  const [surveyId, setSurveyId] = useState(null);

  const handleQuestionChange = (idx, value) => {
    setQuestions(qs => qs.map((q, i) => (i === idx ? value : q)));
  };

  const handleDeleteQuestion = (index) => {
    setQuestions(qs => qs.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    setQuestions(qs => [...qs, '']);
  };

  const handleFinalCreate = async () => {
    try {
      const newSurveyId = await onCreateSurvey({
        title: survey.title,
        description: survey.description,
        questions: questions.filter(q => q.trim() !== '')
      });
      
      setSurveyId(newSurveyId);
      setShowShareLink(true);
    } catch (error) {
      console.error('Error creating survey:', error);
      alert('Failed to create survey. Please try again.');
    }
  };

  const handleCloseShareLink = () => {
    setShowShareLink(false);
    onBack();
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#f5f6fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: 40, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minWidth: 350, maxWidth: 700, width: '100%' }}>
        <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Editing Survey Questions</h2>
        <div style={{ marginBottom: 24 }}>
          <b>Survey Title:</b> {survey.title}<br/>
          <b>Description:</b> {survey.description}
        </div>
        <form>
          {questions.map((q, idx) => (
            <div key={idx} style={{ marginBottom: 18, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontWeight: 'bold' }}>Question {idx + 1}</label>
                <button 
                  type="button"
                  onClick={() => handleDeleteQuestion(idx)}
                  style={{
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: 0
                  }}
                  title="Delete question"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                value={q}
                onChange={e => handleQuestionChange(idx, e.target.value)}
                style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 4, border: '1px solid #ccc', fontSize: 16 }}
                placeholder="Enter your question here"
              />
            </div>
          ))}
          <button 
            type="button"
            onClick={handleAddQuestion}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '10px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>+</span> Add Question
          </button>
        </form>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button 
            onClick={onBack} 
            style={{ 
              flex: 1,
              padding: '10px', 
              background: '#f5f5f5', 
              border: '1px solid #ddd', 
              borderRadius: '6px', 
              fontSize: '16px', 
              cursor: 'pointer'
            }}
          >
            Back
          </button>
          <button 
            onClick={handleFinalCreate}
            disabled={questions.length === 0 || questions.some(q => q.trim() === '')}
            style={{ 
              flex: 1,
              padding: '10px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: questions.length > 0 && !questions.some(q => q.trim() === '') ? 'pointer' : 'not-allowed',
              opacity: questions.length > 0 && !questions.some(q => q.trim() === '') ? 1 : 0.7
            }}
          >
            Create Survey
          </button>
        </div>
      </div>
      
      {showShareLink && (
        <ShareSurveyLink 
          surveyId={surveyId} 
          onClose={handleCloseShareLink}  
        />
      )}
    </div>
  );
}

function SurveyForm({ survey, onSubmit }) {
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would submit these responses to your backend
    console.log('Survey responses:', responses);
    setSubmitted(true);
    if (onSubmit) onSubmit(responses);
  };

  if (submitted) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '40px auto',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Thank You! 🎉</h2>
        <p>Your response has been recorded.</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '10px' }}>{survey.title}</h2>
      {survey.description && <p style={{ color: '#666', marginBottom: '20px' }}>{survey.description}</p>}
      
      <form onSubmit={handleSubmit}>
        {survey.questions.map((question, idx) => (
          <div key={idx} style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '16px'
            }}>
              {question}
              <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={responses[idx] || ''}
              onChange={(e) => handleChange(idx, e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Your answer"
            />
          </div>
        ))}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showCreateSurvey, setShowCreateSurvey] = useState(false);
  const [surveyDraft, setSurveyDraft] = useState(null);
  const [showReviewQuestions, setShowReviewQuestions] = useState(false);
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [surveys, setSurveys] = useState({}); // In a real app, this would come from a backend

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setMessage('');
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (err) {
      setMessage('Error connecting to server');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: registerUsername, password: registerPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowRegister(false);
        setMessage('Registration successful! Please log in.');
        setRegisterUsername('');
        setRegisterPassword('');
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (err) {
      setMessage('Error connecting to server');
    }
    setRegisterLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setUsername('');
    setPassword('');
    setMessage('');
  };

  const handleCreateSurvey = async (surveyData) => {
    const newSurveyId = 'survey-' + Math.random().toString(36).substr(2, 9);
    const newSurvey = {
      id: newSurveyId,
      ...surveyData,
      createdAt: new Date().toISOString(),
      owner: user?.username || 'anonymous',
      responses: []
    };
    
    // Save to localStorage for persistence
    const savedSurveys = JSON.parse(localStorage.getItem('surveys') || '{}');
    savedSurveys[newSurveyId] = newSurvey;
    localStorage.setItem('surveys', JSON.stringify(savedSurveys));
    
    // Update state
    setSurveys(prev => ({
      ...prev,
      [newSurveyId]: newSurvey
    }));
    
    return newSurveyId;
  };

  const handleSubmitResponse = async (surveyId, responses) => {
    // Load current surveys from localStorage
    const savedSurveys = JSON.parse(localStorage.getItem('surveys') || '{}');
    const survey = savedSurveys[surveyId];
    
    if (!survey) {
      console.error('Survey not found:', surveyId);
      return;
    }
    
    // Create updated survey with new response
    const updatedSurvey = {
      ...survey,
      responses: [
        ...(survey.responses || []),
        {
          id: 'resp-' + Math.random().toString(36).substr(2, 9),
          submittedAt: new Date().toISOString(),
          answers: responses
        }
      ]
    };
    
    // Save updated survey back to localStorage
    savedSurveys[surveyId] = updatedSurvey;
    localStorage.setItem('surveys', JSON.stringify(savedSurveys));
    
    // Update state
    setSurveys(prev => ({
      ...prev,
      [surveyId]: updatedSurvey
    }));
  };

  const handleDeleteSurvey = (surveyId) => {
    // Remove from localStorage
    const savedSurveys = JSON.parse(localStorage.getItem('surveys') || '{}');
    delete savedSurveys[surveyId];
    localStorage.setItem('surveys', JSON.stringify(savedSurveys));
    
    // Update state
    setSurveys(prev => {
      const newSurveys = { ...prev };
      delete newSurveys[surveyId];
      return newSurveys;
    });
  };

  // Load surveys from localStorage on initial render
  React.useEffect(() => {
    const savedSurveys = JSON.parse(localStorage.getItem('surveys') || '{}');
    setSurveys(savedSurveys);
  }, []);

  const path = window.location.pathname;
  const isSurveyPath = path.startsWith('/survey/');
  const surveyId = isSurveyPath ? path.split('/survey/')[1] : null;

  if (isSurveyPath && surveyId) {
    // Check both in-memory state and localStorage for the survey
    const survey = surveys[surveyId] || 
                 JSON.parse(localStorage.getItem('surveys') || '{}')[surveyId] || 
                 null;
    
    if (!survey) {
      return (
        <div style={{
          maxWidth: '600px',
          margin: '40px auto',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2>Survey Not Found</h2>
          <p>The survey you're looking for doesn't exist or may have been deleted.</p>
        </div>
      );
    }
    
    return <SurveyForm survey={survey} onSubmit={(responses) => handleSubmitResponse(surveyId, responses)} />;
  }

  if (user && showReviewQuestions && surveyDraft) {
    return (
      <ReviewQuestions 
        survey={surveyDraft} 
        onBack={() => { 
          setShowReviewQuestions(false); 
          setShowCreateSurvey(true); 
        }}
        onCreateSurvey={handleCreateSurvey}
      />
    );
  }

  if (user && showCreateSurvey) {
    return <CreateSurvey onBack={() => setShowCreateSurvey(false)} onNext={draft => { setSurveyDraft(draft); setShowCreateSurvey(false); setShowReviewQuestions(true); }} />;
  }

  if (user) {
    return (
      <Dashboard 
        user={user} 
        onLogout={handleLogout} 
        onCreateSurvey={() => setShowCreateSurvey(true)}
        surveys={surveys}
        onDeleteSurvey={handleDeleteSurvey}
      />
    );
  }

  if (showRegister) {
    return (
      <div style={{ maxWidth: 400, margin: '100px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: 10 }}>
            <label>Username</label>
            <input
              type="text"
              value={registerUsername}
              onChange={e => setRegisterUsername(e.target.value)}
              required
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Password</label>
            <input
              type="password"
              value={registerPassword}
              onChange={e => setRegisterPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </div>
          <button type="submit" disabled={registerLoading} style={{ width: '100%', padding: 10 }}>
            {registerLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <button onClick={() => setShowRegister(false)} style={{ width: '100%', marginTop: 10, padding: 10 }}>
          Back to Login
        </button>
        {message && <div style={{ marginTop: 20, color: message.includes('successful') ? 'green' : 'red' }}>{message}</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <button onClick={() => setShowRegister(true)} style={{ width: '100%', marginTop: 10, padding: 10 }}>
        Register
      </button>
      {message && <div style={{ marginTop: 20, color: message.includes('successful') ? 'green' : 'red' }}>{message}</div>}
    </div>
  );
}

export default App;
