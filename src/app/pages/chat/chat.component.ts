import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

  imageUrl: string | ArrayBuffer | null = null;
  audioUrl: string | null = null;
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  transcription: string = '';
  recognition: any;

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.initSpeechRecognition();
    }
  }

  onFileChanged(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleRecording(): void {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording(): void {
    this.isRecording = true;
    this.audioChunks = [];
    this.recognition.start();

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data);
        };
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          this.audioUrl = URL.createObjectURL(audioBlob);
        };
        this.mediaRecorder.start();
      });
  }

  stopRecording(): void {
    this.isRecording = false;
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    this.recognition.stop();
  }

  playAudio(audioElement: HTMLAudioElement): void {
    audioElement.play();
  }

  initSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'es-ES';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      this.transcription = event.results[0][0].transcript;
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
    };
  }
}