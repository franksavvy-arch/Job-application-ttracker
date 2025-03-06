from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///job_applications.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)

class JobApplication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(100), nullable=False)
    job_title = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    job_link = db.Column(db.String(200))
    notes = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'companyName': self.company_name,
            'jobTitle': self.job_title,
            'status': self.status,
            'date': self.date.isoformat(),
            'jobLink': self.job_link,
            'notes': self.notes
        }

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/applications', methods=['GET'])
def get_applications():
    applications = JobApplication.query.all()
    return jsonify([app.to_dict() for app in applications])

@app.route('/applications', methods=['POST'])
def create_application():
    data = request.json
    new_application = JobApplication(
        company_name=data['companyName'],
        job_title=data['jobTitle'],
        status=data['status'],
        date=datetime.fromisoformat(data['date']),
        job_link=data.get('jobLink', ''),
        notes=data.get('notes', '')
    )
    db.session.add(new_application)
    db.session.commit()
    return jsonify(new_application.to_dict()), 201

@app.route('/applications/<int:id>', methods=['PUT'])
def update_application(id):
    application = JobApplication.query.get_or_404(id)
    data = request.json
    application.company_name = data['companyName']
    application.job_title = data['jobTitle']
    application.status = data['status']
    application.date = datetime.fromisoformat(data['date'])
    application.job_link = data.get('jobLink', '')
    application.notes = data.get('notes', '')
    db.session.commit()
    return jsonify(application.to_dict())

@app.route('/applications/<int:id>', methods=['DELETE'])
def delete_application(id):
    application = JobApplication.query.get_or_404(id)
    db.session.delete(application)
    db.session.commit()
    return '', 204

@app.route('/applications/status_counts', methods=['GET'])
def get_status_counts():
    status_counts = db.session.query(
        JobApplication.status, 
        db.func.count(JobApplication.id)
    ).group_by(JobApplication.status).all()
    
    return jsonify(dict(status_counts))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)