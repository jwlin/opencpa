from django.db import models

class Job(models.Model):
	# id is implicitly given for each model
	# id = models.AutoField(primary_key=True)
	title = models.CharField(max_length=200)
	sysnam = models.CharField(max_length=200)
	org_name = models.CharField(max_length=200)
	person_kind = models.CharField(max_length=50)
	rank_from = models.PositiveSmallIntegerField()
	rank_to = models.PositiveSmallIntegerField()
	work_quality = models.CharField(max_length=3000)
	work_item =  models.CharField(max_length=1000, null=True)

	def __unicode__(self):
		statement = ' | '.join([
			str(self.id), 
			self.org_name,
			self.sysnam,
			self.title, 
			self.person_kind, 
			str(self.rank_from), 
			str(self.rank_to)
		])
		return statement

class JobHistory(models.Model):
	job = models.ForeignKey(Job)
	date_from = models.DateField()
	date_to = models.DateField()

	def __unicode__(self):
		statement = ' | '.join([
			str(self.job.id), 
			str(self.date_from), 
			str(self.date_to) 
		])
		return statement

class CurrentJob(models.Model):
	job = models.ForeignKey(Job)
	title = models.CharField(max_length=200)
	sysnam = models.CharField(max_length=200)
	org_name = models.CharField(max_length=200)
	person_kind = models.CharField(max_length=50)
	rank_from = models.PositiveSmallIntegerField()
	rank_to = models.PositiveSmallIntegerField()
	num = models.PositiveSmallIntegerField()
	gender = models.CharField(max_length=50)
	work_places_id = models.CommaSeparatedIntegerField(max_length=500)
	#work_place_name = 
	date_from = models.DateField()
	date_to = models.DateField()
	is_handicap = models.BooleanField()
	is_orig = models.BooleanField()
	is_local_orig = models.BooleanField()
	is_training = models.BooleanField()
	job_type = models.CharField(max_length=50)
	email = models.CharField(max_length=1000, null=True)
	work_quality = models.CharField(max_length=3000)
	work_item = models.CharField(max_length=1000, null=True) 
	work_addr = models.CharField(max_length=200, null=True)
	contact = models.CharField(max_length=3000, null=True)
	url = models.CharField(max_length=100, null=True)
	view_url = models.CharField(max_length=200)
	isExpiring = models.BooleanField()
	history_count = models.PositiveSmallIntegerField()

	
	def __unicode__(self):
		statement = ' | '.join([
			str(self.job.id), 
			self.org_name, 
			self.sysnam,
			self.title, 
			self.person_kind, 
			str(self.rank_from), 
			str(self.rank_to)
		])
		return statement
	

class WorkPlace(models.Model):
	work_place_id = models.PositiveSmallIntegerField()
	work_place_name = models.CharField(max_length=30)
	
	def __unicode__(self):
		statement = ' | '.join([
			str(self.work_place_id), 
			self.work_place_name
		])
		return statement
	
class UpdateRecord(models.Model):
	last_update_day = models.DateField()

	def __unicode__(self):
		return str(self.last_update_day)

class JobMessage(models.Model):
	job = models.ForeignKey(Job)
	message = models.CharField(max_length=100)
	last_modified = models.DateTimeField(auto_now=True)
	password =  models.CharField(max_length=20)

	def __unicode__(self):
		msg = self.message[:50] + '..' if len(self.message) > 50 else self.message
		return str(self.job.id) + ' | ' + msg

	
